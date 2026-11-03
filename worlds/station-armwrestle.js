// s477 ARM WRESTLING · THE IRON TABLE at Luxor Station's PIT, in the room (minigames/strength/arm-wrestling.js world mode).
// Walk onto the gold ring → the room fades into the back-room table (lamp, chalk ladder, crowd) → camera eases in →
// one big PUSH button (tap fast; tap on the closing ring = COUNTER). Ladder PIP → HOPE → BRUNO → NOBLE → IRON TUSK, the belt.
export function makeArmWrestleConsole(K, { at, yaw = 0, room, hide = () => [], scene, where = 'The Pit · the iron table', kicker = 'The Pit · back table' }) {
  const { THREE } = K;
  const parent = new THREE.Group(); parent.position.set(at.x, 0, at.z); parent.rotation.y = yaw; K.scene.add(parent);
  let g = null, h = null, open = false, loading = false, hidden = [], bg0 = null;
  const R = { renderer: null, camera: null };
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL('../minigames/strength/arm-wrestling.js?v=s477d', import.meta.url).href); if (!open) { loading = false; return; }
      g = await mod.createArmWrestling({ container: null, world: 'luxor', embed: true, onState: s => { h = s; }, inWorld: { renderer: R.renderer, camera: R.camera, parent } }); } catch (e) { console.warn('arm wrestling in world', e); }
    loading = false; }
  const txt = v => !v ? '' : typeof v === 'string' ? v : (v.t || v.txt || v.text || '');
  return {
    title: 'ARM WRESTLING', where, W: 200, H: 140, hideRoom: true, room, noSticks: true,
    pad: [{ k: 1, label: 'PUSH', sub: 'TAP FAST · TAP ON THE RING = COUNTER' }],
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand: { x: at.x, z: at.z, face: yaw + Math.PI },
    attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 48; }
      camTo.set(at.x, 2.4, at.z + 3.2); lookTo.set(at.x, 1.0, at.z); return 58; },
    begin() { open = true; h = null; hidden = hide().filter(o => o && o.visible); hidden.forEach(o => { o.visible = false; }); if (scene) { bg0 = scene.background; scene.background = new THREE.Color('#1c1410'); } make(); },
    end() { open = false; try { g && g.destroy(); } catch (e) {} g = null; h = null; hidden.forEach(o => { o.visible = true; }); hidden = []; if (scene && bg0) scene.background = bg0; },
    tick() { for (const o of hidden) o.visible = false; },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (d && g) g.tap(0); }, padStick() {},
    hud() { if (!g || !h || !h.three) return { card: { kicker, title: loading || (g && !h) || (h && !h.three) ? 'Setting the table\u2026' : 'Arm Wrestling', body: 'Tap PUSH fast to drive the hands down. Every tap costs stamina, so push in bursts.', buttons: ['NOT NOW'] } };
      if (h.phase === 'done' && h.result) { const r = h.result; return { card: { kicker: (h.rival && h.rival.name ? 'VS ' + h.rival.name : 'The iron table'), title: r.title, mood: r.line || r.sub || '', notes: [r.sub ? 'Rounds ' + r.sub : ''].concat(r.gold ? ['+' + r.gold + ' G'] : []).concat(r.xp ? ['+' + r.xp + ' XP'] : []).concat(r.belt ? ['THE IRON TABLE BELT IS YOURS'] : []).filter(Boolean), buttons: [r.next ? 'NEXT RIVAL' : 'REMATCH', 'LEAVE THE TABLE'] } }; }
      if (h.phase === 'menu' || h.phase === 'lobby' || !h.phase) { const rv = h.rival || {}; return { card: { kicker, title: 'Arm Wrestling', body: 'Next on the ladder: ' + (rv.name || '') + ' \u00b7 ' + (rv.title || '') + '. \u201C' + (rv.hi || '') + '\u201D Tap PUSH fast, rest when the bar runs low, and tap right on the ring to COUNTER a surge.', buttons: ['WRESTLE ' + (rv.name || ''), 'NOT NOW'] } }; }
      const st = [['You', String((h.sc || [0, 0])[0])], [((h.names || [])[1] || 'Rival'), String((h.sc || [0, 0])[1])], ['Time', (h.tl || 0) + ' s'], ['Stamina', Math.round(((h.st || [1])[0]) * 100) + '%', (h.st || [1])[0] < 0.25 ? '#ec3013' : null]];
      const say = h.cd ? 'GRIP IN ' + h.cd : txt(h.flash) || (h.surge ? (h.surge.hot ? 'NOW! TAP TO COUNTER' : 'SURGE COMING · WAIT FOR THE RING') : 'TAP PUSH FAST · REST WHEN TIRED');
      return { stats: st, showStats: true, where: say, pad: this.pad, noSticks: true, alert: !!(h.surge && h.surge.hot) }; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /NOT NOW|LEAVE/.test(b)) return 'leave'; if (!g) return;
      try { if (/NEXT RIVAL/.test(b)) g.next(); else if (/REMATCH/.test(b)) g.rematch(); else g.play(); } catch (e) { console.warn(e); } },
  };
}
