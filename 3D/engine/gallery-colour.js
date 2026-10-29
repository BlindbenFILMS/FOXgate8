// Blind Canvas gallery: COLOUR INSIDE THE LINES (Ben, 28 Oct). Two easels out in the park, played in the world (no load screen).
// Walk up to an easel, tap COLOUR: a line drawing opens. Its lines are RAISED: a stroke you start inside a shape can only fill that
// shape, never cross a line; when your finger rides onto a line or into the next shape the phone buzzes (Android) and a soft hum
// plays, so you can colour by feel. DONE hangs your picture on the easel for everyone walking by (saved on this device).
// Wiring: gallery.html loads this after the gallery is ready (window.COLOUR), the ACTIONS button calls COLOUR.open().
// (28 Oct, Ben) moved off the walks to an ART CORNER on the lawn beside the WHY House's west wall: three easels in a soft arc on a
// pale gravel pad, facing the north walk, a paint table in the middle, the sign at the corner nearest the walk
export const EASELS = [{ x: 27.4, z: 31.2, face: -Math.PI / 2 - 0.35, pic: 'eye' }, { x: 26.6, z: 35.0, face: -Math.PI / 2, pic: 'flower' }, { x: 27.4, z: 38.8, face: -Math.PI / 2 + 0.35, pic: 'house' },
  // (Ben, 28 Oct) two more INSIDE the WHY House, in the front corners by the door, turned to the room (the comment spot moved outside)
  { x: 35.0, z: 28.2, face: 0.671, pic: 'heart', inside: 1 }, { x: 45.0, z: 28.2, face: -0.671, pic: 'hands', inside: 1 },
  { x: 33.4, z: 38.4, face: 2.159, pic: 'sunrise', inside: 1 }, { x: 46.6, z: 38.4, face: -2.159, pic: 'idea', inside: 1 }];   // (Ben, 28 Oct) the two back corners too; every WHY House easel starts on its own picture
const CORNER = { x0: 25.8, x1: 30.6, z0: 30.4, z1: 41.4, sign: [27.0, 28.4] };   // (verified clear of the north walk: pad corners pathDist >= 1.0, sign 1.1)

// the pictures: closed shapes in 0..1 (y down). Lines are 2.2 % of the sheet wide, so a finger can feel them.
const PICS = {
  eye: { name: 'The Eye', lines: [
    [[0.08, 0.5], [0.2, 0.36], [0.35, 0.27], [0.5, 0.24], [0.65, 0.27], [0.8, 0.36], [0.92, 0.5], [0.8, 0.64], [0.65, 0.73], [0.5, 0.76], [0.35, 0.73], [0.2, 0.64], [0.08, 0.5]],
    circle(0.5, 0.5, 0.2, 40), circle(0.5, 0.5, 0.085, 28), circle(0.44, 0.43, 0.03, 14)] },
  house: { name: 'Home', lines: [
    [[0.18, 0.47], [0.5, 0.18], [0.82, 0.47], [0.18, 0.47]], [[0.24, 0.47], [0.24, 0.84], [0.76, 0.84], [0.76, 0.47]],
    [[0.44, 0.84], [0.44, 0.62], [0.56, 0.62], [0.56, 0.84]], [[0.29, 0.54], [0.39, 0.54], [0.39, 0.64], [0.29, 0.64], [0.29, 0.54]], [[0.61, 0.54], [0.71, 0.54], [0.71, 0.64], [0.61, 0.64], [0.61, 0.54]],
    circle(0.82, 0.16, 0.07, 24), [[0.04, 0.84], [0.96, 0.84]]] },
  fish: { name: 'Fish', lines: [
    [[0.16, 0.5], [0.3, 0.33], [0.5, 0.28], [0.66, 0.34], [0.74, 0.5], [0.66, 0.66], [0.5, 0.72], [0.3, 0.67], [0.16, 0.5]], [[0.74, 0.5], [0.9, 0.34], [0.9, 0.66], [0.74, 0.5]],
    circle(0.3, 0.46, 0.03, 14), [[0.46, 0.3], [0.42, 0.5], [0.46, 0.7]], [[0.56, 0.3], [0.52, 0.5], [0.56, 0.7]]] },
  flower: { name: 'Flower', lines: [
    circle(0.5, 0.36, 0.08, 24), ...[0, 1, 2, 3, 4, 5].map(i => petal(0.5, 0.36, i * Math.PI / 3)), [[0.49, 0.5], [0.49, 0.9]], [[0.51, 0.5], [0.51, 0.9]],
    [[0.5, 0.74], [0.36, 0.64], [0.3, 0.7], [0.5, 0.78]], [[0.04, 0.9], [0.96, 0.9]]] },
  heart: { name: 'Heart', lines: [heartPath(0.5, 0.5, 0.4), heartPath(0.5, 0.48, 0.24), heartPath(0.5, 0.465, 0.1)] },   // (28 Oct) a true heart curve, with two hearts inside it
  hands: { name: 'Helping Hand', lines: [
    [[0.38, 0.92], [0.37, 0.62], [0.30, 0.56], [0.22, 0.47], [0.19, 0.42], [0.21, 0.38], [0.25, 0.38], [0.31, 0.43], [0.37, 0.48], [0.38, 0.30], [0.39, 0.21], [0.415, 0.18], [0.44, 0.21], [0.445, 0.43],
      [0.455, 0.43], [0.46, 0.17], [0.49, 0.14], [0.52, 0.17], [0.525, 0.43], [0.535, 0.43], [0.54, 0.20], [0.565, 0.17], [0.59, 0.20], [0.595, 0.46], [0.605, 0.47], [0.61, 0.28], [0.63, 0.26], [0.65, 0.28], [0.655, 0.56],
      [0.64, 0.67], [0.62, 0.75], [0.62, 0.92], [0.38, 0.92]], [[0.38, 0.82], [0.62, 0.82]], heartPath(0.5, 0.63, 0.085)] },
  sunrise: { name: 'Sunrise', lines: [
    [[0.04, 0.62], [0.96, 0.62]], [...circle(0.5, 0.62, 0.19, 40).filter(([x, y]) => y <= 0.62 + 1e-6)],
    ...[-70, -45, -20, 0, 20, 45, 70].map(d => { const a = (d - 90) * Math.PI / 180; return [[0.5 + Math.cos(a) * 0.25, 0.62 + Math.sin(a) * 0.25], [0.5 + Math.cos(a) * 0.36, 0.62 + Math.sin(a) * 0.36]]; }),
    [[0.04, 0.80], [0.2, 0.72], [0.36, 0.76], [0.52, 0.86], [0.7, 0.74], [0.84, 0.70], [0.96, 0.76]]] },
  idea: { name: 'Bright Idea', lines: [
    [...arcPts(0.5, 0.38, 0.2, 120, 420, 48), [0.56, 0.66], [0.44, 0.66], [0.4, 0.38 + 0.2 * Math.sin(120 * Math.PI / 180)]],   // the glass, narrowing into the neck
    [[0.42, 0.66], [0.58, 0.66], [0.58, 0.82], [0.42, 0.82], [0.42, 0.66]], [[0.42, 0.715], [0.58, 0.715]], [[0.42, 0.77], [0.58, 0.77]], [[0.47, 0.82], [0.5, 0.87], [0.53, 0.82]],
    [[0.46, 0.66], [0.46, 0.47], [0.48, 0.42], [0.5, 0.47], [0.52, 0.42], [0.54, 0.47], [0.54, 0.66]],
    ...[-60, -30, 0, 30, 60].map(d => { const a = (d - 90) * Math.PI / 180; return [[0.5 + Math.cos(a) * 0.26, 0.38 + Math.sin(a) * 0.26], [0.5 + Math.cos(a) * 0.34, 0.38 + Math.sin(a) * 0.34]]; })] },

};
function heartPath(cx, cy, s) { const p = []; for (let i = 0; i <= 72; i++) { const t = i / 72 * Math.PI * 2, x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); p.push([cx + x / 17 * s, cy - y / 17 * s - s * 0.08]); } return p; }
function arcPts(cx, cy, r, a0, a1, n) { const p = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
function circle(cx, cy, r, n) { const p = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
function petal(cx, cy, a) { const p = [], R0 = 0.08, R1 = 0.24, W = 0.32; for (let i = 0; i <= 14; i++) { const t = i / 14, ang = a + (t - 0.5) * W * 2 * Math.sin(Math.PI * t), r = R0 + (R1 - R0) * Math.sin(Math.PI * t * 0.5 + (t > 0.5 ? (t - 0.5) * Math.PI : 0)) * (t < 0.5 ? 1 : 1); p.push([cx + Math.cos(ang) * (R0 + (R1 - R0) * Math.sin(Math.PI * t)), cy + Math.sin(ang) * (R0 + (R1 - R0) * Math.sin(Math.PI * t))]); } return p; }
const PALETTE = ['#ec3013', '#f59e0b', '#ffd23a', '#22a35a', '#22b8b0', '#1d4fd8', '#7c3aed', '#ec6fa5', '#8a5a32', '#f3f2f2', '#9aa0a6', '#1d1c1b'];
const N = 512, LW = 0.022;   // sheet pixels, line width

export function setupColour({ G }) {
  const W = G.world, THREE = W.THREE, scene = W.scene;
  const save = (() => { try { return JSON.parse(localStorage.getItem('bcp.colour') || '{}'); } catch (e) { return {}; } })();
  const persist = () => { try { localStorage.setItem('bcp.colour', JSON.stringify(save)); } catch (e) {} };
  // ---- a sheet: line mask + region ids (flood fill) + the colours
  function makeSheet(picKey) {
    const lineC = document.createElement('canvas'); lineC.width = lineC.height = N; const lc = lineC.getContext('2d');
    lc.fillStyle = '#fff'; lc.fillRect(0, 0, N, N); lc.strokeStyle = '#000'; lc.lineWidth = LW * N; lc.lineCap = lc.lineJoin = 'round';
    for (const ln of PICS[picKey].lines) { lc.beginPath(); ln.forEach(([x, y], i) => i ? lc.lineTo(x * N, y * N) : lc.moveTo(x * N, y * N)); lc.stroke(); }
    lc.lineWidth = LW * N * 1.2; lc.strokeRect(2, 2, N - 4, N - 4);   // a frame, so the background is a closed shape too
    const d = lc.getImageData(0, 0, N, N).data, id = new Int32Array(N * N).fill(-1);
    for (let i = 0; i < N * N; i++) if (d[i * 4] < 128) id[i] = 0;   // 0 = a raised line
    let next = 1; const st = [];
    for (let s = 0; s < N * N; s++) { if (id[s] !== -1) continue; id[s] = next; st.push(s);
      while (st.length) { const p = st.pop(), x = p % N, y = (p / N) | 0; for (const q of [x > 0 ? p - 1 : -1, x < N - 1 ? p + 1 : -1, y > 0 ? p - N : -1, y < N - 1 ? p + N : -1]) if (q >= 0 && id[q] === -1) { id[q] = next; st.push(q); } }
      next++; }
    const paint = document.createElement('canvas'); paint.width = paint.height = N; const pc = paint.getContext('2d'); pc.fillStyle = '#fbf8f1'; pc.fillRect(0, 0, N, N);
    return { pic: picKey, lineC, id, paint, pc, masks: new Map() };
  }
  function regionMask(S, r) {   // a canvas, opaque only inside region r (cached)
    if (S.masks.has(r)) return S.masks.get(r);
    const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), im = x.createImageData(N, N);
    for (let i = 0; i < N * N; i++) if (S.id[i] === r) im.data[i * 4 + 3] = 255;
    x.putImageData(im, 0, 0); S.masks.set(r, c); return c; }
  const compose = (S, out) => { const o = out.getContext('2d'); o.drawImage(S.paint, 0, 0, out.width, out.height); o.globalCompositeOperation = 'multiply'; o.drawImage(S.lineC, 0, 0, out.width, out.height); o.globalCompositeOperation = 'source-over'; };
  // ---- the easels in the park
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), oak = new THREE.MeshLambertMaterial({ color: 0xb08356 }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  { const y = Math.max(0, W.groundAt((CORNER.x0 + CORNER.x1) / 2, 5, (CORNER.z0 + CORNER.z1) / 2));
    const gt = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#e4ddcf'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2600; i++) { const l = 190 + Math.random() * 55 | 0; x.fillStyle = 'rgb(' + l + ',' + (l - 6) + ',' + (l - 16) + ')'; x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 6); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(CORNER.x1 - CORNER.x0, CORNER.z1 - CORNER.z0), new THREE.MeshLambertMaterial({ map: gt, polygonOffset: true, polygonOffsetFactor: -2 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set((CORNER.x0 + CORNER.x1) / 2, y + 0.02, (CORNER.z0 + CORNER.z1) / 2); scene.add(pad);
    for (const [w, d, x, z] of [[CORNER.x1 - CORNER.x0 + 0.2, 0.1, (CORNER.x0 + CORNER.x1) / 2, CORNER.z0], [CORNER.x1 - CORNER.x0 + 0.2, 0.1, (CORNER.x0 + CORNER.x1) / 2, CORNER.z1], [0.1, CORNER.z1 - CORNER.z0, CORNER.x0, (CORNER.z0 + CORNER.z1) / 2]]) { const e = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), ink); e.position.set(x, y + 0.03, z); scene.add(e); }
    // the paint table between the easels: a round oak top, pots of colour, a jar of brushes
    const tg = new THREE.Group(); tg.position.set(28.9, y, 35.0); scene.add(tg);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24), oak); top.position.y = 0.74; tg.add(top);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.72, 10), ink); stem.position.y = 0.36; tg.add(stem);
    PALETTE.slice(0, 8).forEach((c, k) => { const a = k / 8 * Math.PI * 2, pot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.09, 12), new THREE.MeshLambertMaterial({ color: c })); pot.position.set(Math.cos(a) * 0.33, 0.81, Math.sin(a) * 0.33); tg.add(pot); });
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.16, 12), new THREE.MeshLambertMaterial({ color: 0xbfd8e0, transparent: true, opacity: 0.7 })); jar.position.y = 0.85; tg.add(jar);
    for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 5), oak); b.position.set((k - 2) * 0.018, 0.95, (k % 2 - 0.5) * 0.02); b.rotation.z = (k - 2) * 0.12; tg.add(b); } }
  const easels = EASELS.map((E, i) => {
    const y = Math.max(0, W.groundAt(E.x, 5, E.z)), g = new THREE.Group(); g.position.set(E.x, y, E.z); g.rotation.y = E.face; scene.add(g);
    const leg = (x, z, rx, rz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.0, 0.06), oak); m.position.set(x, 0.98, z); m.rotation.set(rx, 0, rz); g.add(m); };
    leg(-0.5, 0.1, -0.08, 0.1); leg(0.5, 0.1, -0.08, -0.1); leg(0, -0.42, 0.32, 0);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.14), oak); shelf.position.set(0, 0.66, 0.16); g.add(shelf);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.24, 1.24, 0.04), ink); board.position.set(0, 1.33, 0.12); board.rotation.x = -0.1; g.add(board);
    const S = makeSheet(save['p' + i] || E.pic); if (save['c' + i]) { const im = new Image(); im.onload = () => { S.pc.drawImage(im, 0, 0); refresh(); }; im.src = save['c' + i]; }
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 1.16), new THREE.MeshBasicMaterial({ map: tex })); face.position.set(0, 1.33, 0.145); face.rotation.x = -0.1; g.add(face);
    const rule = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.04, 0.05), red); rule.position.set(0, 1.97, 0.06); rule.rotation.x = -0.1; g.add(rule);
    const pal = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 18), oak); pal.scale.z = 0.7; pal.position.set(0.32, 0.7, 0.18); g.add(pal);
    for (let k = 0; k < 5; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 8), new THREE.MeshBasicMaterial({ color: PALETTE[(k * 2 + i) % 10] })); d.position.set(0.32 + Math.cos(k * 1.2) * 0.09, 0.712, 0.18 + Math.sin(k * 1.2) * 0.06); g.add(d); }
    const refresh = () => { compose(S, cv); tex.needsUpdate = true; }; refresh();
    return { E, g, S, refresh, i };
  });
  // a sign between them
  { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 300; const c = cv.getContext('2d'); const F = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
    const draw = () => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, 512, 300); c.fillStyle = '#ec3013'; c.fillRect(0, 286, 512, 14); c.fillRect(28, 30, 72, 12);
      c.fillStyle = '#f3f2f2'; c.font = `800 74px ${F}`; c.fillText('COLOUR', 26, 124); c.font = `800 46px ${F}`; c.fillText('INSIDE THE LINES', 26, 182);
      c.fillStyle = '#ffd23a'; c.font = `700 26px ${F}`; c.fillText('Raised lines · feel them buzz', 28, 240); tex.needsUpdate = true; };
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; draw(); if (document.fonts) document.fonts.ready.then(draw);
    const [x, z] = CORNER.sign, y = Math.max(0, W.groundAt(x, 5, z)), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = -Math.PI / 2 - 0.5; scene.add(g);
    for (const s of [-0.7, 0.7]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.2, 0.07), ink); p.position.set(s, 1.1, 0); g.add(p); }
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.05), ink); b.position.set(0, 1.75, 0); g.add(b);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.44, 0.844), new THREE.MeshBasicMaterial({ map: tex })); f.position.set(0, 1.75, 0.027); g.add(f); }
  W.addNear(Pl => { let b = null, bd = 2.3; for (const e of easels) { const d = Math.hypot(Pl.x - e.E.x, Pl.z - e.E.z); if (d < bd) { bd = d; b = e; } } return b ? { kind: 'colour', item: { z: b.i, easel: b.i }, label: 'Colour Inside the Lines · ' + PICS[b.S.pic].name } : null; });

  // ---- the colouring panel (dark, Modernist, phone first)
  const undo = [], snap = () => { try { undo.push(cur.S.pc.getImageData(0, 0, N, N)); if (undo.length > 12) undo.shift(); } catch (e) {} };
  let P = null, cur = null, col = PALETTE[0], brush = 0.05, region = -1, last = null, ac = null, osc = null, og = null, bzT = 0;
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const hum = (on, f) => { try { if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); osc = ac.createOscillator(); og = ac.createGain(); og.gain.value = 0; osc.type = 'triangle'; osc.connect(og).connect(ac.destination); osc.start(); }
      if (ac.state !== 'running') ac.resume(); og.gain.setTargetAtTime(on ? 0.05 : 0, ac.currentTime, 0.03); if (f) osc.frequency.setTargetAtTime(f, ac.currentTime, 0.02); } catch (e) {} };
  function build() {
    P = document.createElement('div'); P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', 'Colour inside the lines');
    P.style.cssText = 'position:fixed;inset:0;z-index:40;background:#141312;color:#f3f2f2;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:12px;padding:calc(10px + env(safe-area-inset-top)) 10px calc(10px + env(safe-area-inset-bottom));font-family:Archivo,Arimo,sans-serif;touch-action:none';
    P.innerHTML = `<div id="ciHead" style="flex-basis:100%;display:flex;align-items:center;gap:10px;max-width:980px"><div style="flex:1;min-width:0"><div style="font:800 11px/1 inherit;letter-spacing:.16em;color:#ff9783">COLOUR INSIDE THE LINES</div><div id="ciName" style="font:800 22px/1.15 inherit"></div></div><button id="ciX" aria-label="Close" style="width:48px;height:48px;border:2px solid #f3f2f2;background:none;color:#f3f2f2;font:800 20px inherit;cursor:pointer">✕</button></div>
      <div style="position:relative;width:min(92vw,64dvh,620px);aspect-ratio:1;flex:none;align-self:flex-start"><canvas id="ciCv" width="${N}" height="${N}" style="width:100%;height:100%;display:block;border:2px solid #f3f2f2;background:#fbf8f1;cursor:crosshair;touch-action:none"></canvas></div>
      <div style="display:flex;flex-direction:column;gap:10px;width:min(92vw,620px);max-width:620px;flex:1 1 260px">
        <div id="ciPal" role="radiogroup" aria-label="Colours" style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px"></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px" id="ciBr"></div>
        <div id="ciPics" role="radiogroup" aria-label="Pictures" style="display:grid;grid-template-columns:repeat(9,1fr);gap:5px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button id="ciUndo" class="ciB">↶ UNDO</button><button id="ciClr" class="ciB">CLEAR</button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button id="ciDone" class="ciB" style="background:#1d4fd8;border-color:#1d4fd8">HANG ON THE EASEL</button><button id="ciWhy" class="ciB" style="background:#ec3013;border-color:#ec3013">SHARE IN THE WHY HOUSE</button></div>
        <div style="font:600 12px/1.4 inherit;color:#cfcaca">The black lines are raised: start inside a shape and the colour stays in it. Touch a line and it buzzes and hums. Share it in the WHY House with a few words about why you create.</div></div>`;
    document.body.appendChild(P);
    const st = document.createElement('style'); st.textContent = '.ciB{min-height:48px;border:2px solid #f3f2f2;background:none;color:#f3f2f2;font:800 11px/1.2 Archivo,Arimo,sans-serif;letter-spacing:.08em;cursor:pointer;padding:4px}.ciB:hover{background:#3a2723}.ciB:focus-visible,#ciPal button:focus-visible{outline:3px solid #8fb4ff;outline-offset:2px}'; P.appendChild(st);
    const pal = P.querySelector('#ciPal'); PALETTE.forEach(c => { const b = document.createElement('button'); b.setAttribute('role', 'radio'); b.setAttribute('aria-label', 'Colour ' + c); b.style.cssText = `min-height:44px;background:${c};border:3px solid #141312;outline:2px solid #5a5654;cursor:pointer`; b.onclick = () => { col = c; syncPal(); }; pal.appendChild(b); });
    const br = P.querySelector('#ciBr'); [['THIN', 0.025], ['MEDIUM', 0.05], ['BIG', 0.09]].forEach(([n, v]) => { const b = document.createElement('button'); b.className = 'ciB'; b.textContent = n; b.dataset.v = v; b.onclick = () => { brush = v; syncPal(); }; br.appendChild(b); });
    P.querySelector('#ciX').onclick = close;
    P.querySelector('#ciClr').onclick = () => { snap(); cur.S.pc.fillStyle = '#fbf8f1'; cur.S.pc.fillRect(0, 0, N, N); draw(); };
    const pics = P.querySelector('#ciPics'); Object.keys(PICS).forEach(k => { const b = document.createElement('button'); b.setAttribute('role', 'radio'); b.setAttribute('aria-label', PICS[k].name); b.dataset.k = k; b.style.cssText = 'aspect-ratio:1;min-height:44px;border:2px solid #5a5654;background:#fbf8f1;cursor:pointer;padding:3px';
      const t = makeSheet(k).lineC; const c2 = document.createElement('canvas'); c2.width = c2.height = 64; c2.getContext('2d').drawImage(t, 0, 0, 64, 64); c2.style.cssText = 'width:100%;height:100%;display:block;pointer-events:none'; b.appendChild(c2);
      b.onclick = () => { if (k === cur.S.pic) return; const S2 = makeSheet(k); Object.assign(cur.S, { pic: k, lineC: S2.lineC, id: S2.id, masks: new Map() }); cur.S.pc.fillStyle = '#fbf8f1'; cur.S.pc.fillRect(0, 0, N, N); undo.length = 0; P.querySelector('#ciName').textContent = PICS[k].name; syncPal(); draw(); }; pics.appendChild(b); });
    P.querySelector('#ciUndo').onclick = () => { const u = undo.pop(); if (u) { cur.S.pc.putImageData(u, 0, 0); draw(); } };
    P.querySelector('#ciWhy').onclick = () => { const o = document.createElement('canvas'); o.width = o.height = 360; compose(cur.S, o); let q = 0.82, d = o.toDataURL('image/jpeg', q); while (d.length > 38000 && q > 0.35) { q -= 0.08; d = o.toDataURL('image/jpeg', q); }
      P.querySelector('#ciDone').click(); if (window.NOTES && window.NOTES.openWhy) window.NOTES.openWhy({ art: d, artName: PICS[cur.S.pic].name }); else { const L = document.getElementById('live'); if (L) L.textContent = 'The WHY House is still opening. Try again in a moment.'; } };
    P.querySelector('#ciDone').onclick = () => { cur.refresh(); save['p' + cur.i] = cur.S.pic; try { save['c' + cur.i] = cur.S.paint.toDataURL('image/jpeg', 0.8); } catch (e) {} persist(); close(); const L = document.getElementById('live'); if (L) L.textContent = 'Your picture is hanging on the easel.'; };
    const cv = P.querySelector('#ciCv'), scratch = document.createElement('canvas'); scratch.width = scratch.height = N; const sx = scratch.getContext('2d');
    const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * N, (e.clientY - r.top) / r.height * N]; };
    const idAt = (x, y) => { const xi = Math.max(0, Math.min(N - 1, x | 0)), yi = Math.max(0, Math.min(N - 1, y | 0)); return cur.S.id[yi * N + xi]; };
    const dab = (x0, y0, x1, y1) => { const S = cur.S; sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, N, N); sx.strokeStyle = col; sx.lineWidth = brush * N; sx.lineCap = 'round'; sx.beginPath(); sx.moveTo(x0, y0); sx.lineTo(x1, y1); sx.stroke();
      sx.globalCompositeOperation = 'destination-in'; sx.drawImage(regionMask(S, region), 0, 0); S.pc.drawImage(scratch, 0, 0); };
    const feel = (x, y) => { const id = idAt(x, y), out = id !== region; if (out) { const now = performance.now(); if (now - bzT > 80) { bzT = now; buzz(16); } } hum(out, 180 + 260 * (1 - y / N)); cv.style.outline = out ? '3px solid #ec3013' : 'none'; };
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {} const [x, y] = at(e); const id = idAt(x, y); region = id > 0 ? id : -1; last = [x, y]; if (region > 0) { snap(); dab(x, y, x + 0.01, y); draw(); } feel(x, y); });
    cv.addEventListener('pointermove', e => { if (!last) return; const [x, y] = at(e); if (region > 0) { dab(last[0], last[1], x, y); draw(); } feel(x, y); last = [x, y]; });
    const up = () => { last = null; region = -1; hum(false); cv.style.outline = 'none'; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    P.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') close(); }, true); P.addEventListener('keyup', e => e.stopPropagation(), true);
  }
  function syncPal() { P.querySelectorAll('#ciPal button').forEach((b, i) => { const on = PALETTE[i] === col; b.style.outline = on ? '3px solid #ffd23a' : '2px solid #5a5654'; b.setAttribute('aria-checked', on); });
    P.querySelectorAll('#ciPics button').forEach(b => { const on = b.dataset.k === cur.S.pic; b.style.borderColor = on ? '#ffd23a' : '#5a5654'; b.style.borderWidth = on ? '3px' : '2px'; b.setAttribute('aria-checked', on); });
    P.querySelectorAll('#ciBr button').forEach(b => { const on = +b.dataset.v === brush; b.style.background = on ? '#f3f2f2' : 'none'; b.style.color = on ? '#141312' : '#f3f2f2'; }); }
  function draw() { const c = P.querySelector('#ciCv'); const x = c.getContext('2d'); x.clearRect(0, 0, N, N); compose(cur.S, c); }
  function open(item) { const e = easels[item && item.easel != null ? item.easel : 0]; if (cur !== e) undo.length = 0; cur = e; if (!P) build(); P.style.display = 'flex'; window.HUSH = true; P.querySelector('#ciName').textContent = PICS[e.S.pic].name; syncPal(); draw(); setTimeout(() => P.querySelector('#ciX').focus(), 30); }
  function close() { if (!P) return; P.style.display = 'none'; window.HUSH = false; hum(false); if (cur) cur.refresh(); }
  return { open, close, isOpen: () => !!P && P.style.display !== 'none' };
}
