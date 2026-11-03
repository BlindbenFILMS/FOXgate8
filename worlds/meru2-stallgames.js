// MERU 2.0 — s174d MARKET GAME STALLS (Ben): the 6 stalls round the Capsule Corner stalls are games, each with a fox keeper behind the counter.
// Props on each counter show the game (coconuts on posts, a mole cabinet, a pachinko cabinet, dice cups, a shut-the-box tray, dominoes).
// E · PLAY at the stall front opens the real game (g/… or Carnival Coconut Shy) in the panel. In-world play (like the claw crane) comes next, one game per pass.
// Keepers idle, turn to face you when you are close and wave once as you walk up. Static props: one merged Bin (≤ 3 draws) + moles + 6 foxes.
import { makeRoomKit } from './meru2-roomkit.js';
import { keeperPoser } from '../engine/keeper-poser.js?v=s645';   // s620c jointed keeper body language
export function buildStallGames({ THREE, scene, kit, cols, stalls = [], touch }) {
  const { CT, Bin } = makeRoomKit({ THREE, touch }); const root = new THREE.Group(); root.name = 'stallGames'; scene.add(root);
  const b = Bin(), spots = [], keepers = [], moles = [], TOP = 0.96, COCO_LZ = 1.25, MOLE_LZ = 1.66;
  const pip = (n, bg = '#f3f2f2', fg = '#201e1d') => CT(64, 64, (g, w) => { g.fillStyle = bg; g.fillRect(0, 0, w, w); g.fillStyle = fg; const P = { 1: [[32, 32]], 2: [[18, 18], [46, 46]], 3: [[16, 16], [32, 32], [48, 48]], 4: [[18, 18], [46, 18], [18, 46], [46, 46]], 5: [[16, 16], [48, 16], [32, 32], [16, 48], [48, 48]], 6: [[18, 14], [46, 14], [18, 32], [46, 32], [18, 50], [46, 50]] }[n]; for (const [x, y] of P) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); } });
  for (const S of stalls) {
    const c = Math.cos(S.ry), s = Math.sin(S.ry), W = (lx, lz) => [S.x + c * lx + s * lz, S.z - s * lx + c * lz];
    let cb = b; const box = (k, col, w, h, d, lx, y, lz, r = 0) => { const [x, z] = W(lx, lz); cb.box(k, col, w, h, d, x, y, z, S.ry + r); };
    const cyl = (k, col, r, h, lx, y, lz, n = 10, rx = 0) => { const [x, z] = W(lx, lz); cb.cyl(k, col, r, h, x, y, z, n, rx, 0, 1, S.ry); };
    const sph = (k, col, r, lx, y, lz, sy = 1) => { const [x, z] = W(lx, lz); cb.sph(k, col, r, x, y, z, sy, 10); };
    const face = (tex, w, h, lx, y, lz, rx = 0, par = root) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex })); const [x, z] = W(lx, lz); m.position.set(x, y, z); m.rotation.set(rx, S.ry, 0, 'YXZ'); par.add(m); return m; };
    const k = S.kind; let fest = null;
    // s175 COCONUT SHY IN WORLD: the counter props sit in their own group (they hide while you play) and the game builds its shy on fg (the thrower's spot, -z into the stall)
    if (k === 'coconut') { cb = Bin(); box('mat', '#c42d3c', 2.6, 0.05, 0.4, 0, TOP + 0.025, 0.55);
      for (const lx of [-0.8, 0, 0.8]) { cyl('mat', '#e8d9b8', 0.035, 0.42, lx, TOP + 0.21, 0.55, 8); cyl('mat', '#e8d9b8', 0.08, 0.03, lx, TOP + 0.43, 0.55, 10); sph('mat', '#5a3a22', 0.12, lx, TOP + 0.55, 0.55, 0.95); }
      cyl('mat', '#2e4a6b', 0.16, 0.22, 1.15, TOP + 0.11, 0.7, 12); for (let i = 0; i < 3; i++) sph('gls', '#f3f2f2', 0.06, 1.1 + (i - 1) * 0.07, TOP + 0.25, 0.7 + (i % 2) * 0.05);
      const dg = new THREE.Group(); dg.name = 'cocoDeco'; root.add(dg); cb.build(dg); cb = b; const fg = new THREE.Group(); fg.name = 'cocoWorld'; const [gx, gz] = W(0, COCO_LZ); fg.position.set(gx, 0, gz); fg.rotation.y = S.ry; root.add(fg);
      fest = { game: 'coconut', group: fg, x: gx, z: gz, deco: [dg, ...(S.hide ? [S.hide] : [])], hideR: 3.4 }; }
    // s176 WHACK-A-MOLE IN WORLD: the counter cabinet + moles + mallet sit in their own group (hide while you play); the game's full cabinet stands on fg, in front of the counter
    else if (k === 'whack') { cb = Bin(); const dg = new THREE.Group(); dg.name = 'moleDeco'; root.add(dg); box('mat', '#7a4a2a', 1.5, 0.36, 0.7, 0, TOP + 0.18, 0.45); box('mat', '#ffd23a', 1.52, 0.04, 0.72, 0, TOP + 0.37, 0.45); box('mat', '#201e1d', 1.5, 0.5, 0.06, 0, TOP + 0.62, 0.12);
      { const t = CT(256, 64, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.font = '900 34px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('WHACK!', 14, h / 2 + 2); }); face(t, 1.3, 0.34, 0, TOP + 0.66, 0.155, 0, dg); }
      for (let i = 0; i < 6; i++) { const lx = -0.5 + (i % 3) * 0.5, lz = 0.33 + Math.floor(i / 3) * 0.26; cyl('mat', '#201e1d', 0.1, 0.02, lx, TOP + 0.39, lz, 12);
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), new THREE.MeshLambertMaterial({ color: '#8a5a34' })); const [x, z] = W(lx, lz); m.position.set(x, TOP + 0.36, z); m.userData = { y0: TOP + 0.36, ph: i * 1.7 }; dg.add(m); moles.push(m); }
      { const [x, z] = W(0.95, 0.75); cb.cyl('mat', '#c9b28a', 0.03, 0.4, x, TOP + 0.05, z, 6, 0, 1.2, 1, S.ry); cb.cyl('mat', '#ec3013', 0.08, 0.18, x + 0.12, TOP + 0.1, z, 10, 0, 1.2, 1, S.ry); }
      cb.build(dg); cb = b; const fg = new THREE.Group(); fg.name = 'moleWorld'; const [gx, gz] = W(0, MOLE_LZ); fg.position.set(gx, 0, gz); fg.rotation.y = S.ry; root.add(fg);
      fest = { game: 'whack', group: fg, x: gx, z: gz, deco: [dg], hideR: 1.3 }; }
    // s177c PACHINKO IN WORLD: both counter cabinets sit in their own group (hide while you play); the game's machine stands on fg in the middle of the counter
    else if (k === 'pachinko') { cb = Bin(); const dg = new THREE.Group(); dg.name = 'pachiDeco'; root.add(dg); for (const lx of [-0.6, 0.6]) { box('mat', '#ec3013', 0.82, 1.25, 0.32, lx, TOP + 0.625, 0.35); box('mat', '#ffd23a', 0.86, 0.06, 0.36, lx, TOP + 1.28, 0.35);
        const t = CT(128, 192, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#9aa0a6'; for (let y = 16; y < h - 30; y += 14) for (let x = (y / 14) % 2 ? 10 : 17; x < w; x += 14) g.fillRect(x, y, 3, 3); g.fillStyle = '#ec3013'; g.beginPath(); g.arc(w / 2, h - 46, 14, 0, 7); g.fill(); g.fillStyle = '#201e1d'; g.fillRect(0, h - 22, w, 22); g.fillStyle = '#ffd23a'; g.font = '900 14px Archivo, Arial'; g.fillText('FOX GATE', 30, h - 7); });
        face(t, 0.68, 1.02, lx, TOP + 0.66, 0.515, 0, dg); for (let i = 0; i < 6; i++) sph('gls', '#c0c4cc', 0.03, lx - 0.2 + i * 0.08, TOP + 0.06, 0.6); }
      cb.build(dg); cb = b; const fg = new THREE.Group(); fg.name = 'pachiWorld'; const [gx, gz] = W(0, 0.4); fg.position.set(gx, TOP, gz); fg.rotation.y = S.ry; root.add(fg);
      fest = { game: 'pachinko', group: fg, x: gx, z: gz, deco: [dg], hideR: 0.9 }; }
    // s177 LIAR'S DICE IN WORLD: the counter felt, cups + dice sit in their own group (hide while you play); the game's cups + slate stand on fg on the counter top
    else if (k === 'liars') { cb = Bin(); const dg = new THREE.Group(); dg.name = 'liarsDeco'; root.add(dg); box('mat', '#2f6b4f', 2.4, 0.02, 0.8, 0, TOP + 0.01, 0.45);
      for (const lx of [-0.7, 0.7]) { cyl('mat', '#5a3a22', 0.13, 0.22, lx, TOP + 0.12, 0.45, 14, 0); cyl('mat', '#3a2414', 0.135, 0.02, lx, TOP + 0.23, 0.45, 14); }
      const dm = [1, 2, 3, 4, 5, 6].map(n => new THREE.MeshLambertMaterial({ map: pip(n) }));
      for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), [dm[(i + 1) % 6], dm[(i + 4) % 6], dm[i % 6], dm[(i + 2) % 6], dm[(i + 3) % 6], dm[(i + 5) % 6]]); const [x, z] = W(-0.2 + i * 0.1, 0.55 + (i % 2) * 0.06); m.position.set(x, TOP + 0.065, z); m.rotation.y = S.ry + i * 0.4; dg.add(m); }
      cb.build(dg); cb = b; const fg = new THREE.Group(); fg.name = 'liarsWorld'; const [gx, gz] = W(0, 0.45); fg.position.set(gx, TOP, gz); fg.rotation.y = S.ry; root.add(fg);
      fest = { game: 'liars', group: fg, x: gx, z: gz, deco: [dg], hideR: 0.9 }; }
    // s176 SHUT THE BOX IN WORLD: the counter tray, tiles + dice sit in their own group (hide while you play); the game's box stands on fg on the counter top
    else if (k === 'shutbox') { cb = Bin(); const dg = new THREE.Group(); dg.name = 'shutDeco'; root.add(dg); box('mat', '#6b4423', 1.3, 0.1, 0.6, 0, TOP + 0.05, 0.45); box('mat', '#2f6b4f', 1.18, 0.02, 0.38, 0, TOP + 0.09, 0.52);
      const tm = []; for (let n = 1; n <= 9; n++) tm.push(new THREE.MeshLambertMaterial({ map: CT(64, 64, (g, w) => { g.fillStyle = '#f3ead8'; g.fillRect(0, 0, w, w); g.fillStyle = '#201e1d'; g.font = '900 44px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), w / 2, w / 2 + 3); }) }));
      for (let n = 0; n < 9; n++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.13), tm[n]); const [x, z] = W(-0.52 + n * 0.13, 0.29); m.position.set(x, TOP + 0.18, z); m.rotation.set(n % 3 === 1 ? -1.2 : -0.15, S.ry, 0, 'YXZ'); dg.add(m); box('mat', '#e8dcc2', 0.12, 0.14, 0.02, -0.52 + n * 0.13, TOP + 0.17, 0.27); }
      for (const [lx, n] of [[-0.15, 5], [0.12, 3]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshLambertMaterial({ map: pip(n, '#ec3013', '#ffffff') })); const [x, z] = W(lx, 0.6); m.position.set(x, TOP + 0.14, z); m.rotation.y = S.ry + lx * 3; dg.add(m); }
      cb.build(dg); cb = b; const fg = new THREE.Group(); fg.name = 'shutWorld'; const [gx, gz] = W(0, 0.5); fg.position.set(gx, TOP, gz); fg.rotation.y = S.ry; root.add(fg);
      fest = { game: 'shutbox', group: fg, x: gx, z: gz, deco: [dg], hideR: 0.9 }; }
    // s177b DOMINOES IN WORLD: the counter felt + tiles sit in their own group (hide while you play); the game's felt table top stands on fg on the counter top
    else if (k === 'dominoes') { cb = Bin(); const dg = new THREE.Group(); dg.name = 'domDeco'; root.add(dg); box('mat', '#1f4a3a', 2.4, 0.02, 0.8, 0, TOP + 0.01, 0.45);
      const dt = CT(64, 128, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.fillRect(4, h / 2 - 2, w - 8, 4); for (const [x, y] of [[20, 20], [44, 44], [32, 32], [20, 84], [44, 108], [20, 108], [44, 84]]) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); } });
      const dmat = new THREE.MeshLambertMaterial({ map: dt }); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.2), dmat); const [x, z] = W(-0.85 + i * 0.21, 0.5 + (i % 3 === 1 ? 0.05 : 0)); m.position.set(x, TOP + 0.025, z); m.rotation.set(-Math.PI / 2, S.ry + (i % 2 ? Math.PI / 2 : 0), 0, 'YXZ'); dg.add(m); }
      for (let i = 0; i < 6; i++) box('mat', '#201e1d', 0.1, 0.2, 0.03, 0.75 + i * 0.03, TOP + 0.1, 0.25 + i * 0.02, 0.1);
      cb.build(dg); cb = b; const fg = new THREE.Group(); fg.name = 'domWorld'; const [gx, gz] = W(0, 0.45); fg.position.set(gx, TOP + 0.02, gz);   /* s179: felt was flush with the counter top and hid under it */ fg.rotation.y = S.ry; root.add(fg);
      fest = { game: 'dominoes', group: fg, x: gx, z: gz, deco: [dg], hideR: 0.9 }; }
    // keeper behind the counter
    const K = S.game.keeper || {}; const f = kit.makeFox({ key: 'stall_' + k, joints: true, torso: K.torso, outfit: K.outfit, female: K.female, mood: 'happy' });
    { const [x, z] = W(0, -0.72); f.position.set(x, 0, z); f.rotation.y = S.ry; scene.add(f); keepers.push({ f, ry0: S.ry, wave: 0, near: false, x, z, pose: keeperPoser(THREE, ['hips', 'think', 'hips', 'nod']) }); cols.push({ c: [x, z, 0.4] }); }
    const [px, pz] = W(0, 2.3); spots.push({ key: 'stall:game:' + k, x: px, z: pz, r: 1.8, prompt: 'PLAY \u00b7 ' + S.label, play: { label: S.label, url: S.game.url }, ...(fest ? { fest } : {}) });
  }
  b.build(root);
  let far = false;
  function tick(dt, t, P) {
    const d0 = stalls.length ? Math.hypot(P.x - stalls[0].x, P.z - stalls[0].z) : 1e9; const f2 = d0 > (touch ? 70 : 110); if (f2 !== far) { far = f2; root.visible = !f2; keepers.forEach(q => { q.f.visible = !f2; }); } if (far) return;
    for (const m of moles) { const u = Math.sin(t * 2.2 + m.userData.ph); m.position.y = m.userData.y0 + Math.max(0, u) * 0.1 - 0.02; }
    for (const q of keepers) { const d = Math.hypot(P.x - q.x, P.z - q.z), close = d < 6;
      if (close && !q.near) q.wave = 1.4; q.near = close;
      const want = close ? Math.atan2(P.x - q.x, P.z - q.z) : q.ry0; let da = want - q.f.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); q.f.rotation.y += da * Math.min(1, dt * 4);
      try { kit.animFox(q.f, dt, 0, false); } catch (e) {}
      if (q.pose(q.f, dt, q.wave > 0 ? 'wave' : d < 2.5 || d > 18 ? null : 'idle')) { if (q.wave > 0) q.wave -= dt; continue; }
      const A = q.f.userData.P && q.f.userData.P.arms; if (A && q.wave > 0) { q.wave -= dt; A[1].rotation.x = -2.6; A[1].rotation.z = -0.3 + Math.sin(t * 12) * 0.35; } }
  }
  return { spots, tick, keepers };
}
