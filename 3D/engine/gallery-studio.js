// Blind Canvas gallery: CHOOSE YOUR SHIRT (was the Fox Studio).
// A booth on the welcome plaza: step onto the round mat and a panel opens to dress your fox. While it's open the camera
// circles your fox, framed in the part of the screen the panel leaves free.
//  • Look:   Art sweatshirt + Art tee (all-over prints, long / short sleeves), Art suit, Fox tee, Vixen tee
// (27 Oct) in the middle of the entry hall's north wall; three headless mannequins on poles wear the all-over prints
//  • Gear:   none, glasses, white cane, wheelchair
//  • Shirt:  any artwork in the gallery
//  • Fur:    the orange / red / white palettes
//  • Camera: Fox copies my face, Screen head, Face mask (the same switches as in ☰)
// Every choice is saved on this device and sent to the other visitors, so they see your fox as you made it.
export function setupStudio({ G, at = { x: 5.0, z: 8.2 }, face = Math.PI, backings = [], lay = {}, getPrefs, apply, cams, announce }) {
  const { THREE, scene } = G.world;
  const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
  const y0 = G.world.groundAt(at.x, 2, at.z); const Y = y0 > -50 ? y0 : 0;
  const tex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });

  // ---- the booth: a round mat, an ink backdrop with the sign, and three art tees hanging on a rail
  const g = new THREE.Group(); g.position.set(at.x, Y, at.z); g.rotation.y = face; scene.add(g);   // faces into the room
  for (const b of backings) { const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), ink); m.position.set(b.x, b.y, b.z); m.rotation.y = b.ry || 0; scene.add(m); }   // the step-and-repeat and banner boards beside it
  // (27 Oct, Ben) bigger: a 1.6 m mat, a 4.4 x 3.4 m board flat on the wall (lay.bz), and the mannequins left out on the
  // floor near the mat (lay.mz) so there is depth between them and the board
  const L0 = { R: 1.6, BW: 4.4, BH: 3.4, bz: -2.4, by: 0.25, mz: -1.8, ...lay }, R = L0.R, BW = L0.BW, BH = L0.BH, bz = L0.bz, by = L0.by;
  const mat = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshBasicMaterial({ map: tex(512, 512, (c, w) => {
    c.fillStyle = '#1d1c1b'; c.beginPath(); c.arc(256, 256, 256, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#ec3013'; c.lineWidth = 16; c.beginPath(); c.arc(256, 256, 236, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#fff'; c.font = `800 30px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const txt = 'CHOOSE YOUR SHIRT · WEAR THE ART · '.repeat(2); const n = txt.length;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * Math.PI * 2; c.save(); c.translate(256 + Math.cos(a) * 196, 256 + Math.sin(a) * 196); c.rotate(a + Math.PI / 2); c.fillText(txt[i], 0, 0); c.restore(); }
    c.font = '120px serif'; c.fillText('🦊', 256, 262);
  }), polygonOffset: true, polygonOffsetFactor: -2 }));
  mat.rotation.x = -Math.PI / 2; mat.position.y = 0.015; g.add(mat);
  // the board: flat on the wall (no feet when it hangs; feet when it stands on the floor)
  const board = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, 0.08), ink); board.position.set(0, by + BH / 2, bz); g.add(board);
  if (by < 0.5) for (const sx of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.7), ink); f.position.set(sx * (BW / 2 - 0.15), 0.03, bz); g.add(f); }
  const rule = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.02, 0.08, 0.1), red); rule.position.set(0, by + BH + 0.04, bz); g.add(rule);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.3, (BW - 0.3) * 300 / 1024), new THREE.MeshBasicMaterial({ map: tex(1024, 300, (c, w, h) => {
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ff9783'; c.font = `800 36px ${FONT}`; c.fillText('BLIND CANVAS PROJECT', 30, 62);
    c.fillStyle = '#fff'; let fs = 120; c.font = `800 ${fs}px ${FONT}`; while (c.measureText('CHOOSE YOUR SHIRT').width > w - 60 && fs > 50) { fs -= 2; c.font = `800 ${fs}px ${FONT}`; } c.fillText('CHOOSE YOUR SHIRT', 30, 186);
    c.fillStyle = '#e9e5e5'; c.font = `600 40px ${FONT}`; c.fillText('Step on the mat · wear the art', 30, 258);
  }) }));
  sign.position.set(0, by + BH - 0.2 - (BW - 0.3) * 150 / 1024, bz + 0.045); g.add(sign);
  // the art on the board, right under the sign's text (27 Oct, Ben): the three shirts' paintings, side by side
  const arts = G.shirtArts();
  const show = [arts[0], arts.find(a => /curating_hope/.test(a.key)) || arts[1], arts.find(a => /almost_blindness/.test(a.key)) || arts[2]].filter(Boolean);
  { const sz = Math.min((BW - 0.6) / 3 - 0.15, BH - 0.4 - (BW - 0.3) * 300 / 1024 - 0.3); show.forEach((a, i) => { const T = new THREE.MeshBasicMaterial({ color: 0x2b2928 }); const p = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), T); p.position.set((i - 1) * (sz + 0.18), by + BH - 0.2 - (BW - 0.3) * 300 / 1024 - 0.12 - sz / 2, bz + 0.045); g.add(p); new THREE.TextureLoader().load(a.url, t => { t.colorSpace = THREE.SRGBColorSpace; T.map = t; T.color.set(0xffffff); T.needsUpdate = true; }); }); }
  // three headless mannequins on poles from the floor, each in an all-over print (sweatshirt, tee, tee), each in a pool of light
  const steel = new THREE.MeshLambertMaterial({ color: 0xcfcac4 });
  const glowT = tex(64, 64, (c) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,226,170,0.55)'); r.addColorStop(0.6, 'rgba(255,226,170,0.18)'); r.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = r; c.fillRect(0, 0, 64, 64); });
  const glowM = new THREE.MeshBasicMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 });
  const prof = [[0.15, 0], [0.165, 0.08], [0.148, 0.2], [0.158, 0.36], [0.19, 0.5], [0.15, 0.58], [0.07, 0.62], [0.0, 0.63]];
  const torsoGeo = (() => { const gg = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40, -Math.PI, Math.PI * 2), p = gg.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setZ(i, z * (z > 0 ? 0.78 : 0.7)); } gg.computeVertexNormals(); return gg; })();
  show.forEach((a, i) => {
    const long = i === 0, m = new THREE.Group(); m.position.set((i - 1) * 1.25, 0, L0.mz - Math.abs(i - 1) * 0.25); m.rotation.y = (1 - i) * 0.25; m.scale.setScalar(1.3); g.add(m);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), glowM); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.02; m.add(pool);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.035, 24), ink); base.position.y = 0.018; m.add(base);
    const PH = 0.71, TY = PH - 0.02;   // (27 Oct, Ben) the pole 25 % shorter (was 0.95)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, PH, 10), steel); pole.position.y = PH / 2; m.add(pole);
    const torso = new THREE.Mesh(torsoGeo, new THREE.MeshBasicMaterial({ map: G.wrapArt(a.key), color: 0xf2f2f2 })); torso.position.y = TY; m.add(torso);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.08, 14), ink); neck.position.y = TY + 0.66; m.add(neck);
    for (const sx of [-1, 1]) {   // sleeves hanging from rounded shoulders: long on the sweatshirt, short on the tees
      const sm = new THREE.MeshBasicMaterial({ map: G.sleeveArt(a.key, sx), color: 0xf2f2f2, side: THREE.DoubleSide });
      const L2 = long ? 0.42 : 0.15, sl = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.064, L2, 14, 1, true), sm);
      sl.position.set(sx * 0.2, TY + 0.5 - L2 / 2, 0); sl.rotation.z = sx * 0.12; m.add(sl);
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), sm); sh.scale.y = 0.7; sh.position.set(sx * 0.2, TY + 0.5, 0); m.add(sh);
      const cap = new THREE.Mesh(new THREE.CircleGeometry(0.064, 14), ink); cap.rotation.x = Math.PI / 2; cap.position.set(sx * 0.2 + sx * Math.sin(0.12) * L2 / 2, TY + 0.5 - L2 + 0.004, 0); m.add(cap);
    }
  });
  g.updateMatrixWorld(true);
  try { if (G.world.merge) G.world.merge(g); } catch (e) { console.warn('studio merge', e); }   // (29 Oct) phones: the booth's still parts in a few draws

  // ---- step on the mat
  G.world.addNear(pl => Math.hypot(pl.x - at.x, pl.z - at.z) < R + 0.25 && Math.abs(pl.y - Y) < 1.5 ? { kind: 'studio', item: null, label: 'Choose your shirt · dress your fox' } : null);

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
  el.innerHTML = `<header><div><div class="k">Blind Canvas Project</div><h2 id="stT">Choose Your Shirt</h2></div><button id="stX" aria-label="Close the studio">✕</button></header>
  <div class="body">
    <div class="lab">Your look</div><div class="row" id="stLook"></div>
    <div class="lab">Shirt art</div><div class="artname" id="stArtName" aria-live="polite"></div><div class="arts" id="stArts" role="listbox" aria-label="Choose the artwork on your shirt"></div>
    <div class="lab">Gear</div><div class="row" id="stGear"></div>
    <div class="lab">Fur</div><div class="row" id="stFur" style="display:grid;grid-template-columns:repeat(6,minmax(44px,1fr));gap:6px"></div>
    <button class="done" id="stDone">Done · show me off</button>
  </div>`;
  document.body.appendChild(el);
  const $ = id => el.querySelector('#' + id);
  const LOOKS = [['wraptee', 'Art tee'], ['wrap', 'Art sweatshirt'], ['suit', 'Art suit']];   // (29 Oct, Ben) Fox tee + Vixen tee removed
  const GEAR = [['none', 'None'], ['glasses', 'Glasses'], ['cane', 'White cane'], ['chair', 'Wheelchair']];
  const CAMS = [['fox', '🦊 Copies my face'], ['screen', '📺 Screen head'], ['mask', '🎭 Face mask']];
  const btn = (txt, on, fn, label) => { const b = document.createElement('button'); b.textContent = txt; b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) b.classList.add('on'); if (label) b.setAttribute('aria-label', label); b.onclick = fn; return b; };
  let built = false;
  function render() {
    const p = getPrefs();
    $('stLook').replaceChildren(...LOOKS.map(([k, t]) => btn(t, p.look === k, () => { apply({ look: k }); render(); announce('Your fox now wears the ' + t.toLowerCase() + '.'); })));
    $('stGear').replaceChildren(...GEAR.map(([k, t]) => btn(t, (p.extra || 'none') === k, () => { apply({ extra: k }); render(); })));
    const pals = G.palettes().slice(0, 6);   // (29 Oct, Ben) 6 fur colours: one row on a phone
    $('stFur').replaceChildren(...pals.map(c => { const b = btn('', (p.style.pal | 0) === c.i, () => { apply({ style: { ...getPrefs().style, pal: c.i } }); render(); }, 'Fur colour ' + (c.i + 1)); b.className = 'sw' + ((p.style.pal | 0) === c.i ? ' on' : ''); b.style.background = `linear-gradient(135deg, ${c.fur} 0 60%, ${c.dark} 60% 85%, ${c.tip} 85%)`; return b; }));
    // the art strip: built once (lazy thumbnails), then only the selection moves
    if (!built) { built = true; $('stArts').replaceChildren(...arts.map(a => { const b = document.createElement('button'); b.setAttribute('role', 'option'); b.setAttribute('aria-label', a.title); b.dataset.k = a.key; b.innerHTML = `<img loading="lazy" decoding="async" alt="" src="${a.url}">`; b.onclick = () => { apply({ style: { ...getPrefs().style, art: a.key } }); render(); announce('Shirt: ' + a.title); }; return b; })); }
    const cur = p.style.art || arts[0].key;
    $('stArts').querySelectorAll('button').forEach(b => { const on = b.dataset.k === cur; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const a = arts.find(x => x.key === cur); $('stArtName').textContent = a ? a.title : '';
  }
  let isOpen = false;
  const frame = () => { const phone = innerWidth <= 700; G.studioCam({ face, ...(phone ? { x: 0, y: Math.round(el.offsetHeight / 2), dist: 3.4 } : { x: Math.round(el.offsetWidth / 2), y: 0, dist: 3.0 }) }); };   // your fox turns to face the plaza (the backdrop is behind it)
  function open() {
    if (isOpen) return; isOpen = true; render(); el.style.display = 'flex'; frame();
    const sel = $('stArts').querySelector('.on'); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
    $('stX').focus(); announce('Choose your shirt. Pick your look, shirt art, gear and fur. Your fox turns so you can see it.');
  }
  function close() { if (!isOpen) return; isOpen = false; el.style.display = 'none'; G.studioCam(null); }
  addEventListener('resize', () => { if (isOpen) frame(); });
  $('stX').onclick = close; $('stDone').onclick = () => { close(); announce('Looking good.'); };
  return { open, close, isOpen: () => isOpen, refresh: () => { if (isOpen) render(); } };
}
