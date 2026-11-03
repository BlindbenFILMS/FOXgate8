// s481 COLLECTABLES CORNER (every station): Capsule Corner (minigames/capsule) in its WORLD MODE with the 'space' pack, two full-size
// machines side by side: STATIONS & STARSHIPS + 8 GATES VEHICLES (each has 1 VERY RARE figure). The machines stand in the room all the
// time (glass globes full of capsules); the game instance is built when you are aboard that station and dropped when you leave.
// Walk onto the ring → the camera eases into the machine → pad: 1 = the machine's main button (HOLD to turn the crank), 2 SHELF,
// ◀ ▶ = other machine. Drag round the crank, tap the tray capsule, tap / swipe to twist: all straight on the map canvas.
// Big COLLECTABLES sign over the machines + an eye-level sign on a post (Ben: low vision). Save keys = Capsule Corner's (capsuleCorner.*).
import { FONT } from '../engine/textures.js';

export function makeCapsuleConsole(K, { host, at, yaw = 0, ox = 0, scale = 0.8, isHere = () => true, where = 'Collectables \u00b7 capsule machines', kicker = 'Collectables' }) {
  const { THREE } = K;
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); root.rotation.y = yaw; host.add(root);
  const parent = new THREE.Group(); root.add(parent);
  const sx = Math.sin(yaw), sz = Math.cos(yaw), wx = ox + at.x, wz = at.z, SD = 2.0;
  const stand = { x: wx + sx * SD, z: wz + sz * SD, face: yaw + Math.PI };
  let g = null, h = null, open = false, loading = false, idleT = 0, card = 'intro', R = { renderer: null, camera: null };
  // ---- the corner: backboard with the big COLLECTABLES sign, eye-level sign on a post, the floor ring ----
  const tex = (w, hh, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = hh; draw(c.getContext('2d'), w, hh); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const signT = (top, sub, w = 1024, hh = 256) => tex(w, hh, (c, W, H) => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, W, H); c.fillStyle = '#ec3013'; c.fillRect(0, 0, W, H * 0.07); c.fillRect(0, H * 0.93, W, H * 0.07);
    c.fillStyle = '#f3f2f2'; c.textBaseline = 'middle'; c.font = `900 ${Math.round(H * (sub ? 0.42 : 0.56))}px ${FONT}`; c.fillText(top, W * 0.05, H * (sub ? 0.4 : 0.52), W * 0.9);
    if (sub) { c.fillStyle = '#ffd23a'; c.font = `800 ${Math.round(H * 0.2)}px ${FONT}`; c.fillText(sub, W * 0.05, H * 0.76, W * 0.9); } });
  const B = (w, hh, d, col, x, y, z, p = root) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), K.toon(col)); m.position.set(x, y, z); p.add(m); return m; };
  const plane = (w, hh, t, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
  B(3.6, 3.9, 0.12, '#2a2826', 0, 1.95, -0.72); B(3.7, 0.1, 0.18, '#ec3013', 0, 0.05, -0.7); B(3.7, 0.08, 0.16, '#ffd23a', 0, 3.86, -0.68);
  plane(3.4, 0.95, signT('COLLECTABLES', 'CAPSULE MACHINES \u00b7 1 FREE A DAY', 1024, 286), 0, 3.25, -0.65);
  for (const [i, s] of [[0, 'STATIONS & STARSHIPS'], [1, '8 GATES VEHICLES']]) plane(1.5, 0.3, signT(s, null, 1024, 200), (i - 0.5) * 1.75 * scale, 2.45, -0.65);
  B(0.08, 1.9, 0.08, '#4a4e56', 2.1, 0.95, 0.9); { const t = signT('COLLECTABLES', 'STAND ON THE RING'); plane(1.5, 0.42, t, 2.1, 1.72, 0.945); plane(1.5, 0.42, t, 2.1, 1.72, 0.855, Math.PI); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 36), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.9, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.03, SD); root.add(ring);
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL('../minigames/capsule/capsule-corner.js?v=s481', import.meta.url).href);
      const gg = await mod.createCapsuleCorner({ container: null, onState: s => { h = s; }, opts: { pack: 'space', inWorld: { renderer: R.renderer, camera: R.camera, parent, scale, pack: 'space' } } });
      if (!isHere() && !open) { try { gg.destroy(); } catch (e) {} } else { g = gg; g.setBlock(!open); h = g.hud(); } } catch (e) { console.warn('capsule corner', e); }
    loading = false; }
  function drop() { try { g && g.destroy(); } catch (e) {} g = null; h = null; }
  function safe() { if (!g) return; const w = innerWidth, hh = innerHeight, phone = Math.min(w, hh) < 520, land = phone && w > hh;
    g.setSafe(phone && !land ? { top: 108, bottom: 196, left: 0, right: 0 } : land ? { top: 60, bottom: 100, left: 0, right: 200 } : { top: 72, bottom: 130, left: 0, right: 0 }); }
  const S = () => h && h.seriesList ? h.seriesList[h.series] : null;
  function shelfCard() { const notes = []; if (g) for (const sl of h.seriesList) { notes.push(sl.name + ' \u00b7 ' + sl.have + ' / 8' + (sl.done ? ' \u00b7 COMPLETE' : ''));
      for (const f of g.shelf(sl.id)) notes.push((f.count ? f.name + (f.count > 1 ? ' \u00d7' + f.count : '') : '???') + ' \u00b7 ' + f.rarName); }
    return { kicker, title: 'Your shelf \u00b7 ' + h.total + ' / ' + h.totalAll, mood: 'Doubles give \u2605 stars. 5 \u2605 buy a capsule.', notes, buttons: ['BACK TO THE MACHINES', 'LEAVE'] }; }
  const api = {
    title: 'CAPSULE MACHINES', where, W: 200, H: 140,
    surface: { c: new THREE.Vector3(wx, -50, wz), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand, spot: { x: at.x + sx * SD, z: at.z + sz * SD, r: 0.9 },
    attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    // keep the machines alive only while you are aboard this station
    idle(dt) { if (isHere() || open) { idleT = 0; if (!g && !loading && R.renderer) make(); } else if (g && (idleT += dt) > 3) drop(); },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 50; }
      camTo.set(wx + sx * 3.4, 1.7, wz + sz * 3.4); lookTo.set(wx, 1.1, wz); return 50; },
    begin() { open = true; card = 'intro'; if (g) { g.setBlock(false); h = g.hud(); } else make(); },
    end() { open = false; if (g) { try { if (h && h.state === 'reveal') g.act('stow'); g.turn(false); } catch (e) {} g.setBlock(true); } },
    tick() { if (g) { if (open) g.setBlock(!!card); safe(); } },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (!g || !h || card) return; const p = h.primary || {};
      if (k === 1) { if (h.state === 'crank' || h.state === 'coin') g.turn(d); else if (d && p.enabled) g.act(p.kind); }
      else if (k === 2 && d && h.state === 'idle') card = 'shelf'; },
    padStick(x) { if (g && h && !card && x && h.canSwitch) g.pickSeries(h.series + (x > 0 ? 1 : -1)); },
    key(e) { if (!g || card) return; if (e.code === 'KeyC' && e.type === 'keydown' && h.state === 'idle') { card = 'shelf'; return; } try { g.key(e); } catch (er) {} },
    hud() { if (!g || !h) return { card: { kicker, title: loading ? 'Waking the machines\u2026' : 'Capsule machines', body: 'Two machines, sixteen figures to collect.', buttons: ['NOT NOW'] } };
      if (card === 'intro') return { card: { kicker, title: 'Capsule machines', body: 'STATIONS & STARSHIPS and 8 GATES VEHICLES. One free capsule a day, then ' + h.price + ' gold. Each machine hides one VERY RARE figure.', buttons: ['STATIONS & STARSHIPS', '8 GATES VEHICLES', 'MY SHELF', 'NOT NOW'] } };
      if (card === 'shelf') return { card: shelfCard() };
      const s = S(), p = h.primary || {}, f = h.fig;
      const say = h.flash ? h.flash.txt : f && h.state === 'reveal' ? f.name + ' \u00b7 ' + f.rarName + (f.isNew ? ' \u00b7 NEW!' : ' \u00b7 DOUBLE +' + f.starGain + ' \u2605') : (h.hint || '');
      const pad = [{ k: 1, label: p.label || '\u2026', sub: p.sub || '' }]; if (h.state === 'idle') pad.push({ k: 2, label: 'SHELF', sub: h.total + ' / ' + h.totalAll });
      return { stats: [['Gold', String(h.gold)], ['\u2605', String(h.stars)], [s ? s.short : '', s ? s.have + ' / 8' : '']], showStats: true, where: say, pad,
        sticks: h.canSwitch ? [['\u25c0', 'MACHINE', -1, 0], ['\u25b6', 'MACHINE', 1, 0]] : null, noSticks: !h.canSwitch }; },
    cardPick(i) { const c = api.hud().card, b = c && c.buttons[i]; if (!b || /NOT NOW|LEAVE/.test(b)) return 'leave';
      if (/STATIONS/.test(b)) { card = null; g.pickSeries(0); } else if (/VEHICLES/.test(b)) { card = null; g.pickSeries(1); } else if (/SHELF/.test(b)) card = 'shelf'; else card = null; if (g) h = g.hud(); },
  };
  return api;
}
