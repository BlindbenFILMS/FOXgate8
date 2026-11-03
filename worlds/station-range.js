// s475 PHASER RANGE IN THE ROOM (Ben: games load in world like Meru's claw machine). One adapter turns the Shooting Gallery's
// world mode (minigames/gallery/shooting-gallery.js, world=space, opts.inWorld) into a station console game (dsf-console.js):
// walk to the stand → the room fades into a holo-range around you (room group + people hidden, the game builds its own
// starfield booth, targets and phaser on a group at the stand) → the camera eases into the game's camera → tap targets.
// LEAVE brings the room back. Used by DSF Armory, Luxor Iron Watch and Kufa Crew for Hire.
export function makeRangeConsole(K, { at, yaw, room, hide = () => [], save, where = 'Station security', kicker = 'Phaser Range' }) {
  const { THREE, scene } = K;
  const parent = new THREE.Group(); parent.position.set(at.x, 0, at.z); parent.rotation.y = yaw; scene.add(parent);
  const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  let g = null, h = null, open = false, loading = false, mode = 'classic', hidden = [];
  const R = { camera: null, renderer: null };
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL('../minigames/gallery/shooting-gallery.js?v=s475b', import.meta.url).href);
      if (!open) { loading = false; return; }
      g = await mod.createShootingGallery({ container: null, world: 'space', onState: s => { h = s; }, opts: { world: 'space', inWorld: { renderer: R.renderer, camera: R.camera, parent } } });
      try { g.snapCam && g.snapCam(); } catch (e) {} } catch (e) { console.warn('phaser range in world', e); }
    loading = false; }
  function setHidden(on) { if (on) { hidden = hide().filter(o => o && o.visible); hidden.forEach(o => { o.visible = false; }); } else { hidden.forEach(o => { o.visible = true; }); hidden = []; } }
  const toCard = d => ({ kicker: d.kicker || 'DEEP SPACE FOX · PHASER RANGE', title: (d.total != null ? d.total : h ? h.score : 0) + ' pts', mood: d.title || 'Round over',
    notes: (d.rows || []).map(r => Array.isArray(r) ? r[0] + ': ' + r[1] : String(r)).concat((d.prizes || []).map(p => 'PRIZE: ' + (p.name || p))).concat(d.gold ? ['+' + d.gold + ' G'] : []), best: d.newBest ? 'NEW BEST' : d.best ? 'BEST ' + d.best : '', buttons: ['PLAY AGAIN', 'LEAVE THE RANGE'] });
  return {
    title: 'PHASER RANGE', where, W: 200, H: 140, hideRoom: true, room,
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand: { x: at.x, z: at.z, face: yaw + Math.PI },
    attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0);
      const c = g && g.camera; if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 58; }
      camTo.set(at.x, 1.6, at.z); lookTo.copy(camTo).addScaledVector(fwd, 3); lookTo.y = 1.3; return 58; },
    begin() { open = true; h = null; setHidden(true); if (room) room.visible = false; make(); },
    end() { open = false; try { g && g.destroy(); } catch (e) {} g = null; h = null; setHidden(false); if (room) room.visible = true; },
    tick(dt, T, fly) { if (room && open) room.visible = fly < 0.35; for (const o of hidden) o.visible = false; },
    down() {}, move() {}, up() {},
    hud() { if (!g || !h) return { card: { kicker, title: loading ? 'Charging the range…' : 'Phaser Range', body: 'Tap a target to zap it. Eight charges a cell; it recharges by itself. Green helper bots are friends: don\u2019t zap them.', buttons: loading || !g ? ['NOT NOW'] : ['CLASSIC · 45 S', 'RAPID FIRE · 30 S', 'NOT NOW'] } };
      if (h.phase === 'done' && h.done) return { card: toCard(h.done) };
      if (h.phase === 'intro' || h.phase === 'lobby') return { card: { kicker, title: 'Phaser Range', body: 'Tap a target to zap it. Eight charges a cell; it recharges by itself. Green helper bots are friends: don\u2019t zap them.', buttons: ['CLASSIC · 45 S', 'RAPID FIRE · 30 S', 'NOT NOW'] } };
      const st = [['Score', String(h.score || 0)], ['Time', Math.ceil(h.time || 0) + ' s'], ['Charges', (h.ammo != null ? h.ammo : 8) + ' / ' + (h.ammoMax || 8), h.ammo === 0 ? '#ec3013' : null]];
      if (h.mult > 1) st.push(['Combo', '×' + h.mult, '#5fe3ff']);
      return { stats: st, showStats: true, where: h.count ? 'GET READY · ' + h.count : h.flash ? h.flash.txt : 'TAP A TARGET TO ZAP IT · DON\u2019T ZAP THE GREEN HELPER BOTS', alert: h.ammo === 0 }; },
    cardPick(i) { const hud = this.hud(), b = hud.card && hud.card.buttons[i]; if (!b || /NOT NOW|LEAVE/.test(b)) return 'leave';
      if (/RAPID/.test(b)) mode = 'rapid'; else if (/CLASSIC/.test(b)) mode = 'classic';
      if (g) { try { if (/AGAIN/.test(b)) g.again(); else g.start(mode); } catch (e) { console.warn(e); } } },
  };
}
