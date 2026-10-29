// LIVING PUZZLE (Ben, 28 Oct): a painting breaks into a 3x3 / 4x4 sliding puzzle ON THE WALL in front of it; solved = it flashes, then plays its living painting.
// Opened from the VIEW ART panel (PUZZLE.button). Shared: everyone with the same painting's puzzle open shares one board (net.event k 'pzl': ask / st / mv).
export function setupPuzzle({ G }) {
  const THREE = G.world.THREE, scene = G.world.scene, camera = G.world.camera, canvas = G.world.canvas;
  const ink = '#201e1d', bg = '#f3f2f2', red = '#ec3013';
  let ac = null;
  const click = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = 520 + Math.random() * 80; g.gain.setValueAtTime(0.12, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.09); } catch (e) {} };
  function animOf(a) {
    try { const an = G.debug && G.debug.animator; if (!an || !a.ctr) return null; let best = null, bd = 0.8;
      for (const it of an.items) { const m = it.mesh && it.mesh(); if (!m) continue; const d = m.getWorldPosition(new THREE.Vector3()).distanceTo(a.ctr); if (d < bd) { bd = d; best = it; } }
      return best; } catch (e) { return null; }
  }
  // the slim bar (top of the screen; the board itself is in the world)
  const el = document.createElement('div');
  el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Living puzzle');
  el.style.cssText = `position:fixed;left:0;right:0;top:0;z-index:9000;display:none;background:${ink};color:${bg};font-family:Archivo,sans-serif;padding:max(10px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) 10px max(12px,env(safe-area-inset-left));box-sizing:border-box;border-bottom:2px solid ${bg}`;
  for (const ev of ['pointerdown', 'touchstart', 'wheel', 'keydown']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  document.body.appendChild(el);
  const btnCss = `min-height:44px;padding:0 14px;border:2px solid ${bg};background:${ink};color:${bg};font:700 15px Archivo,sans-serif;text-align:left;letter-spacing:.04em;cursor:pointer;border-radius:0`;
  let S = null, net = null;
  const B = { group: null, tiles: [], tex: null, side: 1.6, ctr: null, n: null, video: null, flash: 0 };
  const keyOf = a => (a.title || '') + '@' + (a.ctr ? a.ctr.toArray().map(v => v.toFixed(1)).join(',') : '');
  const send = (a, to) => { if (net && S) net.event({ k: 'pzl', a, key: S.key, n: S.n, t: S.t, mv: S.moves }, to); };
  function onEvent(id, d) {
    if (!d || d.k !== 'pzl' || !S || d.key !== S.key) return;
    if (d.a === 'ask') { send('st', id); return; }
    if ((d.a === 'st' || d.a === 'mv') && Array.isArray(d.t) && d.t.length === d.n * d.n) { const sized = d.n !== S.n; S.n = d.n; S.t = d.t.slice(); S.moves = d.mv | 0; S.done = false; if (sized) build(); if (d.a === 'mv') click(); checkDone(); bar(); }
  }
  function checkDone() { if (!S.done && S.t.every((v, k) => v === k)) { S.done = true; B.flash = 1; bar(); setTimeout(() => { if (S && S.done) living(); }, 900); } }
  function solvable(t, n) { let inv = 0; const f = t.filter(v => v !== n * n - 1); for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) if (f[i] > f[j]) inv++; if (n % 2) return inv % 2 === 0; const row = n - Math.floor(t.indexOf(n * n - 1) / n); return (inv + row) % 2 === 1; }
  function scramble(n) { const t = [...Array(n * n).keys()]; let gap = n * n - 1, prev = -1; for (let k = 0; k < n * n * 25; k++) { const r = Math.floor(gap / n), c = gap % n, nb = []; if (r) nb.push(gap - n); if (r < n - 1) nb.push(gap + n); if (c) nb.push(gap - 1); if (c < n - 1) nb.push(gap + 1); const ch = nb.filter(x => x !== prev); const m = ch[Math.floor(Math.random() * ch.length)]; [t[gap], t[m]] = [t[m], t[gap]]; prev = gap; gap = m; } if (t.every((v, i) => v === i)) return scramble(n); return t; }
  // ---- the board on the wall
  const cellPos = (i, out) => { const n = S.n, sz = B.side / n, r = Math.floor(i / n), c = i % n; return out.set(-B.side / 2 + sz * (c + 0.5), B.side / 2 - sz * (r + 0.5), 0); };
  function clearBoard() { if (!B.group) return; scene.remove(B.group); B.group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); B.group = null; B.tiles = []; if (B.video) { B.video.pause(); B.video.removeAttribute('src'); B.video = null; } }
  function build() {
    clearBoard(); const n = S.n, sz = B.side / n, g = new THREE.Group();
    g.position.copy(B.ctr).addScaledVector(B.n, 0.22); g.lookAt(g.position.clone().add(B.n));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(B.side + 0.12, B.side + 0.12), new THREE.MeshBasicMaterial({ color: ink })); back.position.z = -0.02; g.add(back);
    for (let v = 0; v < n * n; v++) {
      const geo = new THREE.PlaneGeometry(sz * 0.97, sz * 0.97), uv = geo.attributes.uv, vr = Math.floor(v / n), vc = v % n;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, (vc + uv.getX(k)) / n, 1 - (vr + 1 - uv.getY(k)) / n);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: B.tex, color: 0xffffff })); m.userData.v = v;
      cellPos(S.t.indexOf(v), m.position); m.visible = v !== n * n - 1; g.add(m); B.tiles.push(m);
    }
    scene.add(g); B.group = g;
  }
  function living() {
    const it = animOf(S.a); if (!it || !B.group) return;
    const v = document.createElement('video'); Object.assign(v, { src: it.url, loop: true, muted: true, playsInline: true, crossOrigin: 'anonymous' }); v.setAttribute('playsinline', ''); v.play().catch(() => {});
    const vt = new THREE.VideoTexture(v); if (THREE.SRGBColorSpace) vt.colorSpace = THREE.SRGBColorSpace;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(B.side, B.side), new THREE.MeshBasicMaterial({ map: vt })); scr.position.z = 0.01;
    B.tiles.forEach(t => t.visible = false); B.group.add(scr); B.video = v;
  }
  G.world.onTick(dt => {
    if (!S || !B.group) return; const p = new THREE.Vector3(), k = Math.min(1, (dt || 0.016) * 14);
    for (const m of B.tiles) { cellPos(S.t.indexOf(m.userData.v), p); m.position.lerp(p, k); }
    if (S.done && B.tiles.length) { const last = B.tiles[B.tiles.length - 1]; if (!B.video) last.visible = true; }
    if (B.flash > 0) { B.flash = Math.max(0, B.flash - (dt || 0.016) * 1.2); const c = 1 + B.flash * 1.5; for (const m of B.tiles) m.material.color.setRGB(c, c, c); }
  });
  function frame() {
    const v = THREE.MathUtils.degToRad(camera.fov), fit = B.side * 1.3 / (2 * Math.tan(v / 2)) / Math.min(1, camera.aspect);
    const at = B.ctr.clone().addScaledVector(B.n, 0.22), pos = at.clone().addScaledVector(B.n, Math.max(2.2, fit));
    if (camera.aspect < 1) { pos.y += B.side * 0.12; }   // phone portrait: board sits under the bar
    if (G.camSave) G.camSave(); if (G.camShot) G.camShot(pos.toArray(), at.toArray());
  }
  // ---- tapping a tile in the world
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  canvas.addEventListener('pointerdown', e => { if (S) down = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', e => {
    if (!S || !down || S.done) return; const d = down; down = null; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 14) return;
    const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(B.tiles.filter(m => m.visible))[0]; if (hit) slide(S.t.indexOf(hit.object.userData.v));
  });
  function bar() {
    const { a, n, moves, done } = S;
    el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;max-width:1100px">
      <div style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 180px">
        <div style="font:700 12px Archivo;letter-spacing:.12em;color:#ffd400">LIVING PUZZLE · TAP A TILE BY THE GAP</div>
        <div style="font:800 18px/1.15 Archivo;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(a.title || 'Artwork').replace(/</g, '&lt;')}</div>
      </div>
      <div style="font:700 17px Archivo;padding:0 4px" aria-live="polite">${done ? 'SOLVED · ' + moves + ' MOVES' : 'MOVES · ' + moves}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button data-k="size" style="${btnCss}">${n === 3 ? '4 × 4' : '3 × 3'}</button>
        <button data-k="new" style="${btnCss}">MIX</button>
        <button data-k="close" style="${btnCss};border-color:${red}">CLOSE ✕</button>
      </div></div>`;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k; if (k === 'close') close(); if (k === 'new') { start(a, n); send('st'); } if (k === 'size') { start(a, n === 3 ? 4 : 3); send('st'); } });
  }
  function slide(i) {
    const { n, t } = S; if (S.done) return; const g = t.indexOf(n * n - 1);
    const adj = (Math.abs(i - g) === n) || (Math.abs(i - g) === 1 && Math.floor(i / n) === Math.floor(g / n)); if (!adj) return;
    [t[i], t[g]] = [t[g], t[i]]; S.moves++; click(); if (navigator.vibrate) navigator.vibrate(8);
    checkDone(); send('mv'); bar();
  }
  function start(a, n) { let t; do t = scramble(n); while (!solvable(t, n)); Object.assign(S, { n, t, moves: 0, done: false }); build(); bar(); }
  function open(a, n) {
    if (!a || !a.img || !a.ctr) return; if (S) close();
    const it = animOf(a); B.side = it ? Math.max(1, Math.min(2.4, Math.min(it.w || 1.6, it.h || 1.6))) : 1.6;
    B.ctr = a.ctr.clone(); B.n = (a.n ? a.n.clone() : new THREE.Vector3(0, 0, 1)).setY(0).normalize();
    const img = (a.img || '').replace('/img-m/', '/img/');
    B.tex = new THREE.TextureLoader().setCrossOrigin('anonymous').load(img); if (THREE.SRGBColorSpace) B.tex.colorSpace = THREE.SRGBColorSpace;
    S = { a, key: keyOf(a) }; el.style.display = 'block';
    const pc = document.getElementById('px'); if (pc && pc.click) try { pc.click(); } catch (e) {}
    start(a, n || (B.side >= 2 ? 4 : 3)); frame();
    if (net) net.event({ k: 'pzl', a: 'ask', key: S.key });
    el.querySelector('button').focus();
  }
  function close() { el.style.display = 'none'; el.innerHTML = ''; clearBoard(); if (B.tex) { B.tex.dispose(); B.tex = null; } S = null; if (G.camRelease) G.camRelease(); }
  addEventListener('keydown', e => { if (S && e.key === 'Escape') close(); });
  addEventListener('resize', () => { if (S) frame(); });
  function button(a, host) {
    if (!a || !a.img || !host || host.querySelector('[data-puzzle]')) return;
    const b = document.createElement('button'); b.dataset.puzzle = '1'; b.textContent = 'PLAY AS A LIVING PUZZLE →';
    b.style.cssText = `${btnCss};background:${red};border-color:${red};color:#fff;margin:12px 0;width:100%`;
    b.onclick = () => open(a); host.prepend(b);
  }
  return { open, close, button, onEvent, setNet: n => { net = n; }, isOpen: () => !!S };
}
