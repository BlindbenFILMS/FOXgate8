// THE NEW "CHOOSE YOUR SHIRT" STUDIO for the Blind Canvas gallery (13 Nov 2026, Ben's brief). Replaces 3D/engine/gallery-studio.js; no gallery file is changed by it.
// WHAT STANDS THERE (metres; local +z = out into the room, the wall is behind at z 0)
//   the SIGN BOARD (4.4 × 3.4 m ink board, red rule, BLIND CANVAS PROJECT / CHOOSE YOUR SHIRT / Step on the mat · wear the art, three paintings) with
//   THREE MANNEQUINS in front: headless bodies of the same fox the visitors wear, in the ART TEE, the ART SWEATSHIRT and the ART SUIT, each under its painting;
//   a tall MIRROR on each side of the board, each with a round ink MAT on the floor. The mat lies to the OUTER side of its mirror, not in front of it,
//   so the fox standing on the mat does not block the view of the fox turning in the glass.
// THE MIRROR
//   nobody on the mat  → a real reflection: a second camera looks out through the glass from the visitor's mirrored eye point (an off-axis window), so a fox sees itself as it walks by.
//   someone on the mat → the studio is open: the mirror shows that visitor's fox with the chosen outfit, turning slowly on its own, front then back.
//   One 288 × 512 picture either way; it is only drawn when the mirror faces the camera within 16 m (every 2nd frame on touch screens).
// THE PANEL (beside the mirror; a bottom sheet on a narrow screen): FOX male / female · HEAD · SHIRT · PAINTING · GEAR · DONE. Every control has a spoken name, 48 px + targets,
//   works by keyboard (Escape = done). CHANGE FACE opens the faces 10 at a time (BACK / NEXT). Names carry no titles. GEAR is written in words: NONE · SUNGLASSES · CANE · WHEELCHAIR (Ben, 13 Nov).
//   A THIRD MAT lies in front of the middle mannequin, in line with the other two: from it the outfit shows in both mirrors.
// USE
//   const studio = setupStudio({ THREE, scene, renderer, GF, at: { x, z }, y (the floor height: gallery chat, 13 Nov), face, scale, ui, getLook, setLook, announce });   GF = await gameFox(…) from ./game-fox.js
//   every frame, BEFORE the host's own render:  studio.update(dt, camera, playerPosition)
//   getLook() → the visitor's look { head, shirt, art, gear } · setLook(look) → the host rebuilds the visitor's fox (and tells the other visitors)
//   studio.isOpen() · studio.view() → { pos, look } a camera spot facing the mirror · studio.mat (world Vector3) · studio.close() · studio.dispose()
export function setupStudio({ THREE, scene, renderer, GF, at = { x: 0, z: 0 }, y = 0, layer = 0, face = 0, scale = 0.6, ui = document.body, getLook, setLook, announce = () => {}, onOpen = () => {}, onClose = () => {}, topInset = () => 0 }) {
  const INK = '#1d1c1b', RED = '#ec3013', WHITE = '#f3f2f2', touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const flat = c => new THREE.MeshBasicMaterial({ color: c }), G0 = new THREE.Group(); G0.position.set(at.x, y, at.z); G0.rotation.y = face; scene.add(G0);
  const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); G0.add(m); return m; };
  const plane = (w, h, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); G0.add(m); return m; };
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; const go = () => { draw(c.getContext('2d'), w, h); t.needsUpdate = true; }; go(); if (document.fonts && document.fonts.load) document.fonts.load('800 80px Archivo').then(go, () => {}); return t; };
  const BX = -1.1, MX = 2.35, arts = GF.arts, artOf = re => (arts.find(a => re.test(a.key)) || arts[0]).key, SHOW = [['tee', artOf(/walk_through_fear/)], ['sweat', artOf(/curating_hope/)], ['suit', artOf(/almost_blindness/)]];
  // ---- the sign board + the three paintings ----
  box(4.4, 3.4, 0.12, flat(INK), BX, 1.7, 0.08); box(4.4, 0.08, 0.16, flat(RED), BX, 3.44, 0.08);
  plane(4.0, 1.25, new THREE.MeshBasicMaterial({ map: canvasTex(1024, 320, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.textBaseline = 'alphabetic'; g.fillStyle = RED; g.font = '800 40px Archivo, Arial, sans-serif'; g.fillText('BLIND CANVAS PROJECT', 6, 58);
    g.fillStyle = WHITE; let fs = 124; do { g.font = '800 ' + fs + 'px Archivo, Arial, sans-serif'; fs -= 4; } while (g.measureText('CHOOSE YOUR SHIRT').width > w - 12 && fs > 40); g.fillText('CHOOSE YOUR SHIRT', 0, 190);   /* the headline is fitted to the board's width */ g.font = '600 44px Archivo, Arial, sans-serif'; g.fillText('Step on the mat · wear the art', 6, 268); }) }), BX, 2.66, 0.145);
  const loader = new THREE.TextureLoader();
  SHOW.forEach(([kind, key], i) => { const x = BX + (i - 1) * 1.36, a = arts.find(q => q.key === key); plane(1.14, 1.14, flat(WHITE), x, 1.28, 0.146); const t = loader.load(a.url); t.colorSpace = THREE.SRGBColorSpace; plane(1.04, 1.04, new THREE.MeshBasicMaterial({ map: t }), x, 1.28, 0.15); });
  // ---- the three mannequins: the visitors' own body, headless, in a plain finish, each wearing one of the three art shirts ----
  const PLAIN = { fur: '#d9d5ce', furDark: '#b9b4ac', paw: '#d9d5ce', tailBase: '#b9b4ac', tailMid: '#d9d5ce' }, pole = new THREE.MeshBasicMaterial({ color: '#3a3836' }), manns = [];
  SHOW.forEach(([kind, key], i) => { try { const m = GF.make({ head: 'player', shirt: kind, art: key, gear: 'none' }, { lookOver: PLAIN }); G0.add(m); m.scale.setScalar(scale); m.position.set(BX + (i - 1) * 1.36, 0.42, 1.05);
      GF.tick(m, 0.016, 0); const P = m.userData.P; P.head.visible = false; P.tail.visible = false; P.legs.forEach(l => { l.visible = false; });
      const torso = P.body.children.find(c => c.isMesh && c.geometry.type === 'LatheGeometry'); G0.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(torso || P.body), drop = Math.max(0, b.max.y - 1.12), lo = b.min.y - drop, hi = b.max.y - drop, x = m.position.x, z = m.position.z; m.position.y -= drop;   // (Ben, 15 Nov) shorter again: the whole mannequin stands lower than a visitor's fox (its neck at 1.12 m; a fox is about 1.75 m)
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, lo, 10), pole); st.position.set(x, lo / 2, z); G0.add(st);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.04, 28), flat(INK)); base.position.set(x, 0.02, z); G0.add(base);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.07, 16), flat('#d9d5ce')); neck.position.set(x, hi + 0.02, z); G0.add(neck); manns.push(m);
    } catch (e) { console.warn('mannequin', kind, e); } });
  // ---- the two mirrors + their mats (Ben, 13 Nov): each mat lies to the OUTER side of its mirror, so the fox standing on it never blocks the view of the fox turning in the glass ----
  const MW = 1.9, MH = 3.2, MY = 1.7,   /* (Ben, 15 Nov) bigger mirrors */ V = () => new THREE.Vector3(), matTex = canvasTex(512, 512, (g, w) => { const c = w / 2; g.fillStyle = INK; g.fillRect(0, 0, w, w); g.strokeStyle = RED; g.lineWidth = 16; g.beginPath(); g.arc(c, c, 236, 0, 7); g.stroke();
    g.fillStyle = WHITE; g.font = '800 34px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const s = 'CHOOSE YOUR SHIRT · WEAR THE ART · ', n = s.length * 2; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.save(); g.translate(c + Math.sin(a) * 192, c - Math.cos(a) * 192); g.rotate(a); g.fillText(s[i % s.length], 0, 0); g.restore(); }
    g.strokeStyle = WHITE; g.lineWidth = 6; g.beginPath(); g.arc(c, c, 150, 0, 7); g.stroke(); });
  const ST = [[MX, 1], [BX - 3.45, -1]].map(([mx, side]) => { const rt = new THREE.WebGLRenderTarget(touch ? 304 : 380, touch ? 512 : 640);
    box(MW + 0.18, MH + 0.18, 0.1, flat(INK), mx, MY, 0.07); box(MW + 0.18, 0.08, 0.14, flat(RED), mx, MY + MH / 2 + 0.13, 0.07);
    const glass = plane(MW, MH, new THREE.MeshBasicMaterial({ map: null, color: '#eef1f2' }), mx, MY, 0.125);
    const matM = new THREE.Mesh(new THREE.CircleGeometry(1.05, 56), new THREE.MeshBasicMaterial({ map: matTex })); matM.rotation.x = -Math.PI / 2; matM.position.set(mx + side * 1.95, 0.012, 2.1); G0.add(matM);
    return { rt, glass, matM, side, C: null, mat: null }; });
  const midM = new THREE.Mesh(new THREE.CircleGeometry(1.05, 56), new THREE.MeshBasicMaterial({ map: matTex })); midM.rotation.x = -Math.PI / 2; midM.position.set(BX, 0.012, 3.1); G0.add(midM);   // (Ben, 13 Nov) a 3rd mat, centred in front of the middle mannequin, moved out into the room: 0.7 m of clear floor between it and the mannequins' bases
  G0.updateMatrixWorld(true);
  const N = V().set(0, 0, 1).transformDirection(G0.matrixWorld), Rm = V().set(1, 0, 0).transformDirection(G0.matrixWorld), Up = V().set(0, 1, 0); for (const s of ST) { s.C = s.glass.getWorldPosition(V()); s.mat = s.matM.getWorldPosition(V()); }
  const mat = ST[0].mat, MATS = [ST[0].mat, ST[1].mat, midM.getWorldPosition(V())], USE = [[0], [1], [0, 1]], BC = V().set(BX, MY, 0.1).applyMatrix4(G0.matrixWorld);   // the middle mat shows the outfit in BOTH mirrors
  // ---- a mirror's two pictures ----
  const mirCam = new THREE.PerspectiveCamera(), xc = Rm.clone().negate(), zc = N.clone().negate(), m4 = new THREE.Matrix4().makeBasis(xc, Up, zc), e = V(), v = V(); mirCam.quaternion.setFromRotationMatrix(m4);
  const DY = -60, D = new THREE.Group(); D.position.set(at.x, DY, at.z); scene.add(D);   // the showcase stands out of sight, below the floor
  { const bd = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), flat('#eceae6')); bd.position.set(0, 2, -1.8); D.add(bd); const fl = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), flat('#d8d4cd')); fl.rotation.x = -Math.PI / 2; D.add(fl); const rg = new THREE.Mesh(new THREE.RingGeometry(1.38, 1.5, 48), flat(RED)); rg.rotation.x = -Math.PI / 2; rg.position.y = 0.004; D.add(rg); }
  const showCam = new THREE.PerspectiveCamera(19.5, MW / MH, 0.1, 14); showCam.position.set(at.x, DY + 1.06, at.z + 5.5); showCam.lookAt(at.x, DY + 0.98, at.z);
  let show = null, open = false, cool = false, look = null, sex = 'm', frame = 0, cur = 0;   // cur = the mirror in use
  // (gallery chat, 13 Nov) layer: the reflection draws only that layer (the foxes, the studio, a plain wall standing in for the hall) instead of the whole gallery, which doubled the draws
  if (layer) { mirCam.layers.set(layer); const bk = plane(34, 9, flat('#eceae6'), BX, 3.6, 9.5); bk.rotation.y = Math.PI; bk.layers.set(layer); const fl = new THREE.Mesh(new THREE.PlaneGeometry(34, 10), flat('#b98a5c')); fl.rotation.x = -Math.PI / 2; fl.position.set(BX, 0.003, 4.6); fl.layers.set(layer); G0.add(fl); }
  const showFox = () => { if (show) { D.remove(show); scene.remove(show); } try { show = GF.make(look); D.add(show); show.position.set(0, 0, 0); show.scale.setScalar(scale); } catch (er) { console.warn('studio fox', er); show = null; } };
  function drawMirror(camera, s, i) {
    const prev = renderer.getRenderTarget(), rt = s.rt, C = s.C; for (const q of ST) q.glass.visible = false;
    if (open && USE[cur].includes(i)) { rt.texture.repeat.x = 1; rt.texture.offset.x = 0; renderer.setRenderTarget(rt); renderer.render(scene, showCam); glassPic(s, true); }
    else { camera.getWorldPosition(e); const dE = v.subVectors(e, C).dot(N); if (dE > 0.05 && e.distanceTo(C) < 16) {
      mirCam.position.copy(e).addScaledVector(N, -2 * dE); v.subVectors(C, mirCam.position); const cx = v.dot(xc), cy = v.dot(Up);   // the eye, mirrored through the glass; the glass is its window
      mirCam.projectionMatrix.makePerspective(cx - MW / 2, cx + MW / 2, cy + MH / 2, cy - MH / 2, dE, dE + 60); mirCam.projectionMatrixInverse.copy(mirCam.projectionMatrix).invert();
      rt.texture.repeat.x = -1; rt.texture.offset.x = 1; renderer.setRenderTarget(rt); renderer.render(scene, mirCam); glassPic(s, true); } else glassPic(s, false); }
    renderer.setRenderTarget(prev); for (const q of ST) q.glass.visible = true;
  }
  // (gallery, 15 Nov) a mirror too far away or side-on to draw shows plain pale glass, never a black (or stale) picture
  const glassPic = (s, on) => { const m = s.glass.material, want = on ? s.rt.texture : null; if (m.map !== want) { m.map = want; m.needsUpdate = true; } };
  // ---- the panel ----
  const el = (tag, css, props = {}, kids = []) => { const n = document.createElement(tag); n.style.cssText = css; for (const k in props) { if (k === 'text') n.textContent = props[k]; else if (k === 'on') n.addEventListener('click', props[k]); else n.setAttribute(k, props[k]); } for (const c of kids) n.appendChild(c); return n; };
  const F = 'Archivo,system-ui,sans-serif', BTN = on => 'min-height:48px;padding:8px 10px;display:flex;align-items:center;gap:8px;border:2px solid ' + WHITE + ';border-radius:0;font:800 14px/1.15 ' + F + ';text-align:left;white-space:nowrap;cursor:pointer;background:' + (on ? WHITE : INK) + ';color:' + (on ? INK : WHITE);
  const panel = el('div', 'position:absolute;z-index:6;display:none;box-sizing:border-box;background:' + INK + ';color:' + WHITE + ';font-family:' + F + ';overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px 20px', { role: 'dialog', 'aria-label': 'Choose your shirt', 'data-voice': 'on' });
  const live = el('div', 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)', { 'aria-live': 'polite' }), body = el('div', ''); ui.appendChild(panel);
  const narrow = () => (ui.clientWidth || innerWidth) < 760, say = t => { live.textContent = t; announce(t); };
  const place = () => { const n = narrow(); panel.style.cssText += n ? ';left:0;right:0;top:auto;bottom:0;width:auto;height:44%;border-top:2px solid ' + WHITE + ';border-left:0' : ';right:0;top:' + (topInset() | 0) + 'px;bottom:0;left:auto;height:auto;width:min(400px,92%);border-left:2px solid ' + WHITE + ';border-top:0'; };
  const GEAR = [['none', 'NONE', 'No gear'], ['sun', 'SUNGLASSES', 'Sunglasses'], ['cane', 'CANE', 'Cane'], ['chair', 'WHEELCHAIR', 'Wheelchair']];   /* words, not icons (Ben, 13 Nov) */
  let faces = false, page = 0;   /* CHANGE FACE opens the faces, 10 at a time */
  const set = (patch, spoken) => { const onlyArt = Object.keys(patch).length === 1 && patch.art; look = { ...look, ...patch }; try { setLook && setLook({ ...look }); } catch (er) { console.warn(er); } if (onlyArt && show) GF.wear(show, look.art); else showFox(); render(); if (spoken) say(spoken); };
  function render() {
    if (page * 10 >= GF.HEADS.filter(h => h.sex === sex && h.grp !== 'GUARD').length) page = 0;
    const keep = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-k'), sec = (title, kids, css) => el('section', 'margin-top:14px', {}, [el('h3', 'margin:0 0 6px;font:800 12px ' + F + ';letter-spacing:.08em;color:' + WHITE, { text: title }), el('div', css || 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px', {}, kids)]);
    const b = (k, label, on, go, more = {}) => el('button', BTN(on), { type: 'button', 'data-k': k, 'aria-pressed': String(!!on), on: go, ...more }, label ? [el('span', 'white-space:nowrap', { text: label })] : []);
    const heads = GF.HEADS.filter(h => h.sex === sex && h.grp !== 'GUARD'), pages = Math.max(1, Math.ceil(heads.length / 10)), hd = GF.HEADS.find(h => h.k === look.head), art = arts.find(a => a.key === look.art) || arts[0];
    body.replaceChildren(
      el('div', 'display:flex;gap:10px;align-items:stretch', {}, [el('h2', 'flex:1;margin:0;font:900 22px/1.05 ' + F + ';color:' + WHITE, { text: 'CHOOSE YOUR SHIRT', tabindex: '-1', 'data-k': 'title' }), el('button', BTN(false) + ';background:' + RED + ';border-color:' + RED + ';color:#fff;font-size:16px;min-width:96px', { type: 'button', 'data-k': 'done', on: () => close(true), text: 'DONE' })]),
      sec('FOX', [['m', 'MALE'], ['f', 'FEMALE']].map(([k, l]) => b('sex' + k, l, sex === k, () => { sex = k; page = 0; const h = GF.HEADS.find(x => x.k === look.head); set(h && h.sex === k ? {} : { head: k === 'f' ? 'playerF' : 'player' }, l.toLowerCase() + ' fox'); }))),
      sec('FACE · ' + (hd ? hd.name : '') + (faces ? ' · ' + (page + 1) + ' OF ' + pages : ''), [b('face', faces ? 'CLOSE FACES' : 'CHANGE FACE', faces, () => { faces = !faces; render(); say(faces ? 'Faces, ' + pages + ' pages of 10' : 'Faces closed'); }, { 'aria-expanded': String(faces) }),
        ...(faces ? [...heads.slice(page * 10, page * 10 + 10).map(h => { const n = b('h' + h.k, h.name, look.head === h.k, () => set({ head: h.k }, 'Face: ' + h.name.toLowerCase())); n.style.fontSize = '13px'; n.prepend(el('span', 'flex:none;width:20px;height:20px;background:' + h.fur + ';border:2px solid ' + (look.head === h.k ? INK : WHITE), { 'aria-hidden': 'true' })); return n; }),
          b('fback', 'BACK', false, () => { page = (page - 1 + pages) % pages; render(); say('Faces, page ' + (page + 1) + ' of ' + pages); }), b('fnext', 'NEXT', false, () => { page = (page + 1) % pages; render(); say('Faces, page ' + (page + 1) + ' of ' + pages); })] : [])], 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px'),
      sec('SHIRT', GF.SHIRTS.map(([k, l]) => b('s' + k, l, look.shirt === k, () => set({ shirt: k }, l.toLowerCase()))), 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px'),
      sec('PAINTING · ' + art.title.toUpperCase(), arts.map(a => { const on = a.key === art.key, n = el('button', 'flex:0 0 auto;width:78px;height:78px;padding:0;background:#3a3836;border:3px solid ' + (on ? RED : WHITE) + ';border-radius:0;cursor:pointer', { type: 'button', 'data-k': 'a' + a.key, role: 'option', 'aria-selected': String(on), 'aria-label': a.title, on: () => set({ art: a.key }, 'Shirt art: ' + a.title) }); n.appendChild(el('img', 'display:block;width:100%;height:100%;object-fit:cover', { loading: 'lazy', decoding: 'async', alt: '', src: a.thumb })); return n; }), 'display:flex;gap:6px;overflow-x:auto;padding:2px 2px 8px'),
      sec('GEAR', GEAR.map(([k, l, spoken]) => b('g' + k, l, look.gear === k, () => set({ gear: k }, spoken), { 'aria-label': spoken })), 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px'));
    if (keep) { const n = body.querySelector('[data-k="' + (window.CSS && CSS.escape ? CSS.escape(keep) : keep) + '"]'); if (n) n.focus({ preventScroll: true }); }
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { if (open) place(); }).observe(ui === document.body ? document.documentElement : ui);   // side panel v bottom sheet follows the host's width
  panel.append(body, live); panel.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(true); });
  function openIt() { if (open) return; faces = false; page = 0; look = { head: 'player', shirt: 'suit', art: GF.DEFAULT_ART, gear: 'none', ...(getLook ? getLook() : {}) }; sex = (GF.HEADS.find(h => h.k === look.head) || {}).sex || 'm'; open = true; showFox(); place(); panel.style.display = 'block'; render();
    const t = body.querySelector('[data-k="title"]'); if (t) t.focus({ preventScroll: true }); say('Choose your shirt. The mirror shows your fox.'); onOpen(); }
  function close(byButton) { if (!open) return; open = false; cool = !!byButton; panel.style.display = 'none'; if (show) { D.remove(show); show = null; } say('Shirt studio closed.'); onClose(); }
  function update(dt, camera, p) {
    if (p) { const ds = MATS.map(m => Math.hypot(p.x - m.x, p.z - m.z)); let near = 0; for (let i = 1; i < ds.length; i++) if (ds[i] < ds[near]) near = i; const d = open ? ds[cur] : ds[near]; if (cool && ds[near] > 1.5) cool = false; if (!open && !cool && d < 0.85) { cur = near; openIt(); } else if (open && d > 1.6) close(false); }
    if (open && show) { GF.tick(show, dt, 0); show.rotation.y += dt * 0.7; }
    if (camera) { frame++; ST.forEach((s, i) => { if (!touch || (open && USE[cur].includes(i)) || (frame & 1) === i) drawMirror(camera, s, i); }); }   // touch screens: the two mirrors take turns
  }
  const view = nar => { if (cur === 2 && !nar) return { pos: BC.clone().addScaledVector(N, 12.5).setY(2.2), look: BC.clone().setY(1.25), mirror: BC.clone(), shift: 3.4 };   /* the middle mat on a wide screen: the board with a mirror each side */
    const s = ST[cur === 2 ? 0 : cur]; return { pos: s.C.clone().addScaledVector(N, 5.6).addScaledVector(Rm, -s.side * 0.5).setY(1.55), look: s.C.clone().addScaledVector(Rm, s.side * 0.45).setY(1.3), mirror: s.C.clone() }; };   // straight on to the mirror; the fox on its mat stands at the side of the picture
  // (gallery, 15 Nov) what the visitor's camera fits on screen while the studio is open: one mirror, straight on (on a phone the mirror is the picture);
  // on a wide screen at the middle mat, both mirrors and the board between them
  const frameFor = nar => { if (cur === 2 && !nar) return { c: BC.clone(), n: N.clone(), w: MX - (BX - 3.45) + MW + 0.5, h: MH + 0.45 };
    const s = ST[cur === 2 ? 0 : cur]; return { c: s.C.clone(), n: N.clone(), w: MW + 0.32, h: MH + 0.34 }; };
  const dispose = () => { scene.remove(G0); scene.remove(D); panel.remove(); for (const s of ST) s.rt.dispose(); };
  if (layer) G0.traverse(o => { if (o.layers.isEnabled(0)) o.layers.enable(layer); });
  return { group: G0, mat, mats: MATS, update, view, frame: frameFor, isOpen: () => open, open: openIt, close: () => close(true), dispose, mirrors: ST.map(s => ({ center: s.C, normal: N })) };
}
