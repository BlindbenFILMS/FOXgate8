// MERU 2.0 — step 3: interiors, part 1. TAVERN [meruTavern] and CASINO [meruCasino], dressed inside the city shells.
// Every game spot opens the original 2D minigame (minigames/meru/*.html) full-screen in the job panel.
// Casino = three SOUND BAYS split by glass partitions (slots west, poker north, wheel south) + the cashier cage, so voices don't stack.
import { buildTavern } from './meru-tavern.js';
import { buildCasinoArt } from './meru2-funrooms.js';
const G = 'minigames/meru/';
export function buildRooms({ THREE, scene, M, toon, kit, cast, cols, grad, save, audio, touch }) {
  const B = (w, h, d, col, x, y, z, ry = 0, o = 0.02) => { const m = M(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? toon(col) : col, x, y, z, null, o); m.rotation.y = ry; return m; };
  const C = (r, h, col, x, y, z, o = 0.02) => M(new THREE.CylinderGeometry(r, r, h, 20), typeof col === 'string' ? toon(col) : col, x, y, z, null, o);
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const glow = c => new THREE.MeshBasicMaterial({ color: c });
  const fox = (key, opt, x, z, ry) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); return f; };
  const tex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const spots = [], npcs = [], flick = [], tavDancers = [];
  const play = (label, url, x, z, r = 1.8) => spots.push({ key: label, x, z, r, prompt: 'PLAY \u00b7 ' + label, play: { label, url: G + url } });

  // ================= TAVERN [meruTavern] (f 12..52 × -100..-60, door S at x 32): the old Meru tavern, worlds/meru-tavern.js =================
  // bar, fireplace, tables, the 3D JUKEBOX and DARTS on the real board (+ Flick); replaces the step-3 placeholder that opened darts.html / jukebox.html
  const tav = buildTavern({ THREE, scene, M, toon, grad, kit, cols, save, audio, touch, rect: { x0: 12, x1: 52, z0: -100, z1: -60 } }); spots.push(...tav.spots);
  {
    const noble = cast.make('noble'); noble.position.set(26, 0, -76); noble.rotation.y = Math.PI * 0.85; scene.add(noble); ring(26, -76, 0.6); npcs.push(noble);
    npcs.push(fox('docBraun', { torso: '#5c6670', outfit: 'coat' }, 39, -85, -Math.PI * 0.75)); tavDancers.push(npcs[npcs.length - 1]); }

  // ================= CASINO (f -150..-105 × -32..32, door E at z 0): art pass 6b dressing + colliders in worlds/meru2-funrooms.js =================
  const casArt = buildCasinoArt({ THREE, scene, cols, touch });
  { const kinds = [['SLOTS', 'slot1.html'], ['TRIPLE SLOTS', 'slot3.html'], ['FOX SLOTS', 'slotFox.html']];
    for (let i = 0; i < 3; i++) play(kinds[i][0], kinds[i][1], -146.4, -7.5 + i * 3, 1.3);
    for (let i = 3; i < 6; i++) spots.push({ ...spots[spots.length - 3], z: -7.5 + i * 3 });
    for (const [x, z, lab, url] of [[-137, -21, 'FIVE CARD POKER', 'poker5.html'], [-122, -22, "TEXAS HOLD'EM", 'pokerTexas.html']]) { ring(x, z, 2.2); play(lab, url, x, z + 3.4, 1.6); }
    play('THE WHEEL', 'wheel.html', -118, 22.5, 1.8);
    npcs.push(fox('casinoPoker1', { torso: '#201e1d', outfit: 'vest' }, -137, -23.6, 0), fox('casinoPoker2', { torso: '#201e1d', outfit: 'vest' }, -122, -24.6, 0), fox('casinoWheel', { torso: '#7a2a3a', outfit: 'suit' }, -121, 26, Math.PI), fox('casinoCashier', { torso: '#2e4a6b', outfit: 'vest' }, -140, 23.6, Math.PI)); }

  function tick(dt, t, P, pfox, cam) { for (const f of npcs) kit.animFox(f, dt, 0, false); tav.tick(dt, t, P, pfox, tavDancers); casArt.tick(dt, t, cam || P); for (const f of flick) { if (f.spin) f.spin.rotation.y += dt * 0.4; else f.scale.y = 0.85 + Math.sin(t * 13) * 0.1 + Math.sin(t * 7.1) * 0.08; } }
  return { spots, tick, tavern: tav, keys: tav.keys, toast: tav.toast, camFix: tav.camFix };
}
