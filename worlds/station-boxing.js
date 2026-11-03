// s476 HOLO-PIT BOXING (Luxor Station · THE PIT): Luxor's Foxy Boxing (minigames/luxor/foxy-boxing.js) in its world mode, as a
// station console game. Walk onto the red ring → the room fades into the holo-arena (the game's own ring, tiers + crowd at the
// Pit) → the camera eases into the fight camera → on-screen pad: 1 JAB · 2 UPPER · 3 BLOCK (hold = power) + LEAN ◀ · DUCK · LEAN ▶.
// Same career as Luxor's Fighting Pit (save keys luxor.box.*): lessons first, then PODD → VEK → SURA → FERRO → LYRA for the IRON BELT.
export function makeBoxingConsole(K, { at, yaw = 0, room, hide = () => [], scene, where = 'The Pit · holo-arena', kicker = 'The Pit · Coach Rusk' }) {
  const { THREE } = K;
  const parent = new THREE.Group(); parent.position.set(at.x, 0, at.z); parent.rotation.y = yaw; K.scene.add(parent);
  let g = null, h = null, open = false, loading = false, hidden = [], bg0 = null;
  const R = { renderer: null, camera: null };
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL('../minigames/luxor/foxy-boxing.js?v=s476', import.meta.url).href); if (!open) { loading = false; return; }
      g = await mod.createBoxing({ container: null, onState: s => { h = s; }, opts: { inWorld: { renderer: R.renderer, camera: R.camera, parent } } }); } catch (e) { console.warn('holo-pit boxing', e); }
    loading = false; }
  const str = v => !v ? '' : typeof v === 'string' ? v : (v.t || v.txt || v.text || '');
  function menu() { const p = h && h.prog, rv = h && h.rivals; if (!p) return null;
    if (!p.unlocked) return { kicker, title: 'Holo-Pit Boxing', body: 'Coach Rusk runs the lessons first. Tap 1 to jab, 2 for an uppercut (hold for power), hold 3 to block. Lean with the arrows to slip a punch.', buttons: ['LESSON ' + Math.min(p.lesson + 1, p.lessons) + ' OF ' + p.lessons, 'NOT NOW'] };
    const r = Math.min(p.round, rv.length - 1), nx = rv[r];
    return { kicker, title: p.champ ? 'Iron Belt Champion' : 'Holo-Pit Boxing', body: p.champ ? 'You hold the IRON BELT. Fight anyone on the card again.' : 'Next on the card: ' + nx.name + ' \u00b7 ' + nx.nick + '. First to 3 knockdowns. Punch on the GREEN ring to counter.', buttons: ['FIGHT ' + nx.name + ' \u00b7 ' + nx.nick, 'LESSONS AGAIN', 'NOT NOW'] }; }
  function doneCard(d) { if (d.won !== undefined) return { kicker: d.round || 'The Pit', title: d.won ? (d.champ ? 'IRON BELT!' : 'YOU WIN') : 'DOWN AND OUT', mood: d.won ? 'You beat ' + d.opp + ' \u00b7 ' + d.nick + '.' : d.opp + ' had your number this time.',
      notes: ['Knockdowns ' + d.kd[1] + ' \u2013 ' + d.kd[0]].concat(d.gold ? ['+' + d.gold + ' G'] : []).concat(d.relic ? ['RELIC: THE IRON BELT'] : []).concat(d.next ? ['Next: ' + d.next.name + ' \u00b7 ' + d.next.nick] : []), buttons: [d.won && d.next ? 'NEXT FIGHT' : 'FIGHT AGAIN', 'LEAVE THE PIT'] };
    return { kicker, title: d.lessons ? 'Lessons passed' : 'Lesson done', mood: d.lessons ? 'Coach Rusk: \u201CYou are ready for the card.\u201D' : 'Nice work.', notes: [], buttons: [d.lessons ? 'TO THE CARD' : 'NEXT LESSON', 'LEAVE THE PIT'] }; }
  return {
    title: 'HOLO-PIT BOXING', where, W: 200, H: 140, hideRoom: true, room,
    pad: [{ k: 1, label: 'JAB', sub: 'HOLD = POWER' }, { k: 2, label: 'UPPER', sub: 'HOLD = POWER' }, { k: 3, label: 'BLOCK', sub: 'HOLD' }],
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand: { x: at.x, z: at.z, face: yaw + Math.PI },
    attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 50; }
      camTo.set(at.x, 3, at.z + 6); lookTo.set(at.x, 1.2, at.z); return 58; },
    begin() { open = true; h = null; hidden = hide().filter(o => o && o.visible); hidden.forEach(o => { o.visible = false; }); if (scene) { bg0 = scene.background; scene.background = new THREE.Color('#2a0e08'); } make(); },
    end() { open = false; try { g && g.destroy(); } catch (e) {} g = null; h = null; hidden.forEach(o => { o.visible = true; }); hidden = []; if (scene && bg0) scene.background = bg0; },
    tick(dt, T, fly) { for (const o of hidden) o.visible = false; },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (g && g.press) g.press(k, d); }, padStick(x, y) { if (g) g.setStick(x, y); },
    hud() { if (!g || !h) return { card: { kicker, title: loading ? 'Lighting the holo-pit\u2026' : 'Holo-Pit Boxing', body: 'The room becomes the Fighting Pit. Gloves up.', buttons: ['NOT NOW'] } };
      if (h.mode === 'done' && h.done) return { card: doneCard(h.done) };
      if (h.mode === 'intro' || h.mode === 'idle' || !h.mode) { const m = menu(); return m ? { card: m } : {}; }
      const st = h.mode === 'lesson' && h.lesson ? [['Lesson', h.lesson.n + ' / ' + h.lesson.of], ['Goal', h.lesson.c + ' / ' + h.lesson.goal]]
        : [['You', String(h.hp), h.hp < 30 ? '#ec3013' : null], ['Rival', h.rival ? Math.round(h.rival.hp * 100) + '%' : '-'], ['KD', h.rival ? h.rival.kd[1] + '\u2013' + h.rival.kd[0] : '-']];
      const say = str(h.call) || str(h.flash) || (h.lesson ? h.lesson.text : h.rival ? 'TELL: ' + h.rival.tell : '');
      return { stats: st, showStats: true, where: say, pad: this.pad }; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /NOT NOW|LEAVE/.test(b)) return 'leave'; if (!g || !h) return;
      const p = h.prog || {}; try {
        if (/^LESSON|LESSONS AGAIN|NEXT LESSON/.test(b)) { const n = /AGAIN/.test(b) ? 0 : Math.min(p.lesson || 0, (p.lessons || 1) - 1); g.startLesson(n); }
        else if (/TO THE CARD/.test(b)) g.startMatch(Math.min(p.round || 0, 4));
        else if (/FIGHT|NEXT FIGHT/.test(b)) { const d = h.done; const r = d && d.won !== undefined ? (d.won && d.next ? Math.min((p.round || 0), 4) : Math.max(0, Math.min((p.round || 0), 4))) : Math.min(p.round || 0, 4); g.startMatch(r); } } catch (e) { console.warn(e); } },
  };
}
