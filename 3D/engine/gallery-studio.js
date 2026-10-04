// Blind Canvas gallery: the Fox Studio.
// A booth on the welcome plaza: step onto the round mat and a panel opens to dress your fox. While it's open the camera
// circles your fox, framed in the part of the screen the panel leaves free.
//  • Look:   Art tee (an all-over print, Walk Through Fear first), Art suit, Fox tee, Vixen tee
//  • Gear:   none, glasses, white cane, wheelchair
//  • Shirt:  any artwork in the gallery
//  • Fur:    the orange / red / white palettes
//  • Camera: Fox copies my face, Screen head, Face mask (the same switches as in ☰)
// Every choice is saved on this device and sent to the other visitors, so they see your fox as you made it.
export function setupStudio({ G, at = { x: 5.0, z: 8.2 }, getPrefs, apply, cams, announce }) {
  const { THREE, scene } = G.world;
  const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
  const y0 = G.world.groundAt(at.x, 2, at.z); const Y = y0 > -50 ? y0 : 0;
  const tex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });

  // ---- the booth: a round mat, an ink backdrop with the sign, and three art tees hanging on a rail
  const g = new THREE.Group(); g.position.set(at.x, Y, at.z); g.rotation.y = Math.PI; scene.add(g);   // faces the plaza (-z)
  const R = 1.3;
  const mat = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshBasicMaterial({ map: tex(512, 512, (c, w) => {
    c.fillStyle = '#1d1c1b'; c.beginPath(); c.arc(256, 256, 256, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#ec3013'; c.lineWidth = 16; c.beginPath(); c.arc(256, 256, 236, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#fff'; c.font = `800 34px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const txt = 'FOX STUDIO · DRESS YOUR FOX · '.repeat(2); const n = txt.length;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * Math.PI * 2; c.save(); c.translate(256 + Math.cos(a) * 196, 256 + Math.sin(a) * 196); c.rotate(a + Math.PI / 2); c.fillText(txt[i], 0, 0); c.restore(); }
    c.font = '120px serif'; c.fillText('🦊', 256, 262);
  }), polygonOffset: true, polygonOffsetFactor: -2 }));
  mat.rotation.x = -Math.PI / 2; mat.position.y = 0.015; g.add(mat);
  // backdrop (behind the mat): a slim ink board on two feet
  const BW = 3.4, BH = 2.7, bz = -(R + 0.35);
  const board = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, 0.08), ink); board.position.set(0, 0.25 + BH / 2, bz); g.add(board);
  for (const sx of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.7), ink); f.position.set(sx * (BW / 2 - 0.15), 0.03, bz); g.add(f); }
  const rule = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.02, 0.06, 0.1), red); rule.position.set(0, 0.25 + BH + 0.03, bz); g.add(rule);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.2, 0.75), new THREE.MeshBasicMaterial({ map: tex(1024, 240, (c, w, h) => {
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ff9783'; c.font = `800 34px ${FONT}`; c.fillText('BLIND CANVAS PROJECT', 40, 62);
    c.fillStyle = '#fff'; c.font = `800 96px ${FONT}`; c.fillText('FOX STUDIO', 40, 160);
    c.fillStyle = '#e9e5e5'; c.font = `600 30px ${FONT}`; c.fillText('Step on the mat · wear the art', 40, 214);
  }) }));
  sign.position.set(0, 0.25 + BH - 0.48, bz + 0.045); g.add(sign);
  // three art tees on a rail
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, BW - 0.5, 8), new THREE.MeshLambertMaterial({ color: 0xcfcac4 })); rail.rotation.z = Math.PI / 2; rail.position.set(0, 1.78, bz + 0.12); g.add(rail);
  const teeShape = (c, w, h) => { c.beginPath(); c.moveTo(w * 0.3, h * 0.06); c.lineTo(w * 0.05, h * 0.2); c.lineTo(w * 0.14, h * 0.38); c.lineTo(w * 0.24, h * 0.33); c.lineTo(w * 0.24, h * 0.96); c.lineTo(w * 0.76, h * 0.96); c.lineTo(w * 0.76, h * 0.33); c.lineTo(w * 0.86, h * 0.38); c.lineTo(w * 0.95, h * 0.2); c.lineTo(w * 0.7, h * 0.06); c.quadraticCurveTo(w * 0.5, h * 0.17, w * 0.3, h * 0.06); c.closePath(); };
  const arts = G.shirtArts();
  const show = [arts[0], arts.find(a => /curating_hope/.test(a.key)) || arts[1], arts.find(a => /almost_blindness/.test(a.key)) || arts[2]].filter(Boolean);
  show.forEach((a, i) => {
    const T = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.1, color: 0x222222 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), T); m.position.set((i - 1) * 0.98, 1.36, bz + 0.15); g.add(m);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 12, Math.PI), new THREE.MeshLambertMaterial({ color: 0xcfcac4 })); hook.position.set((i - 1) * 0.98, 1.79, bz + 0.13); g.add(hook);
    const img = new Image(); img.onload = () => { T.map = tex(256, 256, (c, w, h) => { teeShape(c, w, h); c.save(); c.clip(); c.drawImage(img, 0, 0, w, h); c.restore(); c.lineWidth = 4; c.strokeStyle = '#1d1c1b'; teeShape(c, w, h); c.stroke(); }); T.color.set(0xffffff); T.needsUpdate = true; }; img.src = a.url;
  });
  g.updateMatrixWorld(true);

  // ---- step on the mat
  G.world.addNear(pl => Math.hypot(pl.x - at.x, pl.z - at.z) < R + 0.25 && Math.abs(pl.y - Y) < 1.5 ? { kind: 'studio', item: null, label: 'Fox Studio · dress your fox' } : null);

  // ---- the panel
  const css = document.createElement('style');
  css.textContent = `
  #studio { position:fixed; z-index:30; right:0; top:0; bottom:0; width:min(390px,100vw); display:none; flex-direction:column; background:var(--bg,#f3f2f2); color:var(--ink,#1d1c1b); border-left:2px solid var(--ink,#1d1c1b); font-family:${FONT}; }
  #studio header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:14px 16px 10px; border-bottom:2px solid var(--ink,#1d1c1b); }
  #studio header .k { font:800 11px ${FONT}; letter-spacing:.14em; text-transform:uppercase; color:#ec3013; }
  #studio header h2 { margin:2px 0 0; font:800 24px/1.05 ${FONT}; }
  #studio .body { overflow:auto; padding:6px 16px 16px; -webkit-overflow-scrolling:touch; }
  #studio .lab { font:800 11px ${FONT}; letter-spacing:.14em; text-transform:uppercase; color:#ec3013; margin:14px 0 6px; }
  #studio .row { display:flex; flex-wrap:wrap; gap:6px; }
  #studio button { min-height:44px; padding:8px 12px; border:2px solid var(--ink,#1d1c1b); background:var(--card,#fff); color:inherit; font:800 12px ${FONT}; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; }
  #studio button.on { background:var(--ink,#1d1c1b); color:var(--bg,#f3f2f2); }
  #studio #stX { min-width:44px; padding:0; font-size:18px; }
  #studio .arts { display:flex; gap:8px; overflow-x:auto; padding:2px 2px 8px; scroll-snap-type:x proximity; }
  #studio .arts button { flex:0 0 auto; width:76px; height:76px; min-height:0; padding:0; border-width:3px; scroll-snap-align:start; background:#ddd; }
  #studio .arts button img { width:100%; height:100%; object-fit:cover; display:block; }
  #studio .arts button.on { border-color:#ec3013; }
  #studio .artname { font:600 13px/1.3 ${FONT}; min-height:17px; }
  #studio .sw { width:44px; height:44px; padding:0; }
  #studio .sw.on { outline:3px solid #ec3013; outline-offset:2px; }
  #studio .note { font:600 12px/1.35 ${FONT}; color:#5a5654; margin-top:6px; }
  #studio .done { width:100%; margin-top:16px; background:#ec3013; color:#fff; border-color:var(--ink,#1d1c1b); }
  @media (max-width:700px) { #studio { left:0; top:auto; width:auto; max-height:52vh; border-left:0; border-top:2px solid var(--ink,#1d1c1b); } }`;
  document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'studio'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'false'); el.setAttribute('aria-labelledby', 'stT');
  el.innerHTML = `<header><div><div class="k">Blind Canvas Project</div><h2 id="stT">Fox Studio</h2></div><button id="stX" aria-label="Close the studio">✕</button></header>
  <div class="body">
    <div class="lab">Your look</div><div class="row" id="stLook"></div>
    <div class="lab">Shirt art</div><div class="artname" id="stArtName" aria-live="polite"></div><div class="arts" id="stArts" role="listbox" aria-label="Choose the artwork on your shirt"></div>
    <div class="lab">Gear</div><div class="row" id="stGear"></div>
    <div class="lab">Fur</div><div class="row" id="stFur"></div>
    <div class="lab">Your camera</div><div class="row" id="stCam"></div>
    <div class="note">Fox copies you: your camera stays on this device. Screen head and Face mask: everyone in the gallery sees your camera.</div>
    <button class="done" id="stDone">Done · show me off</button>
  </div>`;
  document.body.appendChild(el);
  const $ = id => el.querySelector('#' + id);
  const LOOKS = [['wrap', 'Art tee'], ['suit', 'Art suit'], ['male', 'Fox tee'], ['female', 'Vixen tee']];
  const GEAR = [['none', 'None'], ['glasses', 'Glasses'], ['cane', 'White cane'], ['chair', 'Wheelchair']];
  const CAMS = [['fox', '🦊 Copies my face'], ['screen', '📺 Screen head'], ['mask', '🎭 Face mask']];
  const btn = (txt, on, fn, label) => { const b = document.createElement('button'); b.textContent = txt; b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) b.classList.add('on'); if (label) b.setAttribute('aria-label', label); b.onclick = fn; return b; };
  let built = false;
  function render() {
    const p = getPrefs();
    $('stLook').replaceChildren(...LOOKS.map(([k, t]) => btn(t, p.look === k, () => { apply({ look: k }); render(); announce('Your fox now wears the ' + t.toLowerCase() + '.'); })));
    $('stGear').replaceChildren(...GEAR.map(([k, t]) => btn(t, (p.extra || 'none') === k, () => { apply({ extra: k }); render(); })));
    const pals = G.palettes();
    $('stFur').replaceChildren(...pals.map(c => { const b = btn('', (p.style.pal | 0) === c.i, () => { apply({ style: { ...getPrefs().style, pal: c.i } }); render(); }, 'Fur colour ' + (c.i + 1)); b.className = 'sw' + ((p.style.pal | 0) === c.i ? ' on' : ''); b.style.background = `linear-gradient(135deg, ${c.fur} 0 60%, ${c.dark} 60% 85%, ${c.tip} 85%)`; return b; }));
    const cs = cams.state();
    $('stCam').replaceChildren(...CAMS.map(([k, t]) => btn(t + (cs === k ? ' · ON' : ''), cs === k, () => { cams.pick(k); setTimeout(render, 300); setTimeout(render, 2500); })));
    // the art strip: built once (lazy thumbnails), then only the selection moves
    if (!built) { built = true; $('stArts').replaceChildren(...arts.map(a => { const b = document.createElement('button'); b.setAttribute('role', 'option'); b.setAttribute('aria-label', a.title); b.dataset.k = a.key; b.innerHTML = `<img loading="lazy" decoding="async" alt="" src="${a.url}">`; b.onclick = () => { apply({ style: { ...getPrefs().style, art: a.key } }); render(); announce('Shirt: ' + a.title); }; return b; })); }
    const cur = p.style.art || arts[0].key;
    $('stArts').querySelectorAll('button').forEach(b => { const on = b.dataset.k === cur; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const a = arts.find(x => x.key === cur); $('stArtName').textContent = a ? a.title : '';
  }
  let isOpen = false;
  const frame = () => { const phone = innerWidth <= 700; G.studioCam({ face: Math.PI, ...(phone ? { x: 0, y: Math.round(el.offsetHeight / 2), dist: 3.4 } : { x: Math.round(el.offsetWidth / 2), y: 0, dist: 3.0 }) }); };   // your fox turns to face the plaza (the backdrop is behind it)
  function open() {
    if (isOpen) return; isOpen = true; render(); el.style.display = 'flex'; frame();
    const sel = $('stArts').querySelector('.on'); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
    $('stX').focus(); announce('Fox Studio. Choose your look, shirt art, gear, fur and camera. Your fox turns so you can see it.');
  }
  function close() { if (!isOpen) return; isOpen = false; el.style.display = 'none'; G.studioCam(null); }
  addEventListener('resize', () => { if (isOpen) frame(); });
  $('stX').onclick = close; $('stDone').onclick = () => { close(); announce('Looking good.'); };
  return { open, close, isOpen: () => isOpen, refresh: () => { if (isOpen) render(); } };
}
