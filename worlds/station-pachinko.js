// s488 QUIRK'S ARCADE · PACHINKO (Deep Space Fox · Quirk's Bar): Fox Gate Pachinko (minigames/pachinko/pachinko.js) in its WORLD MODE on
// one of the three cabinets in the arcade corner (east wall, south of the DABA wheel). The game builds its own machine head on the cabinet
// base (the decor head hides while you play). Pad 1 = SHOOT (hold) · free play 2 = AUTO · for gold 2 = BUY 50 (10 G) · 3 = CASH OUT.
// ◀ / ▶ (or the arrow keys) = handle power. Saves = the pachinko's own (arcadePachinko.*): one ball bank for Meru Market and Quirk's.
export function makePachinkoConsole(K, { at, yaw = 0, scale = 0.75, head = null, where = 'Quirk\u2019s Arcade', kicker = 'Deep Space Fox \u00b7 Quirk\u2019s Arcade', place = 'QUIRK\u2019S ARCADE' }) {
  const { THREE } = K;
  const parent = new THREE.Group(); parent.position.set(at.x, 0, at.z); parent.rotation.y = yaw; K.scene.add(parent);
  const sx = Math.sin(yaw), sz = Math.cos(yaw), stand = { x: at.x + sx * 1.35, z: at.z + sz * 1.35, face: yaw + Math.PI };
  let g = null, h = null, open = false, loading = false, dir = 0, lastP = -1;
  const R = { renderer: null, camera: null };
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL('../minigames/pachinko/pachinko.js?v=s488', import.meta.url).href);
      const gg = await mod.createPachinko({ container: null, world: place, onState: s => { h = s; }, opts: { inWorld: { renderer: R.renderer, camera: R.camera, parent, scale } } });
      if (!open) { try { gg.destroy(); } catch (e) {} } else { g = gg; h = g.hud(); } } catch (e) { console.warn('quirks pachinko', e); }
    loading = false; }
  function safe() { if (!g || !g.setSafe) return; const phone = Math.min(innerWidth, innerHeight) < 520, port = innerWidth < innerHeight;
    g.setSafe(phone && port ? 108 : phone ? 62 : 72, port ? (phone ? 92 : 104) : (phone ? 100 : 120), 0, port ? 112 : 0); }
  const gold = () => h && h.mode === 'gold';
  return {
    title: 'PACHINKO \u00b7 QUIRK\u2019S', where, W: 200, H: 140,
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand, spot: null, attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 50; }
      camTo.set(stand.x, 1.6, stand.z); lookTo.set(at.x, 1.45, at.z); return 50; },
    begin() { open = true; h = null; dir = 0; if (head) head.visible = false; make(); },
    end() { open = false; try { g && g.hold(false); g && g.commitPower(); g && g.destroy(); } catch (e) {} g = null; h = null; if (head) head.visible = true; },
    tick(dt) { if (!g) return; h = g.hud() || h; safe();
      if (dir && h) { const p = Math.max(0, Math.min(1, h.power + dir * dt * 0.45)); if (p !== lastP) { g.setPower(p); lastP = p; } } },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (!g || !h || h.phase !== 'play') return;
      if (k === 1) { g.hold(!!d); return; } if (!d) return;
      if (k === 2) { if (gold()) g.buy(); else g.toggleAuto(); } else if (k === 3 && gold()) g.cashOut(); },
    padStick(x) { dir = x; if (!x && g) try { g.commitPower(); } catch (e) {} },
    key(e) { const dn = e.type === 'keydown';
      if (e.code === 'Space' || e.code === 'Digit1') { e.preventDefault && e.preventDefault(); if (!e.repeat) this.padPress(1, dn); return; }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { this.padStick(dn ? (e.code === 'ArrowLeft' ? -1 : 1) : 0); return; }
      if (dn && !e.repeat && (e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'KeyA')) this.padPress(e.code === 'Digit3' ? 3 : 2, true); },
    hud() {
      if (!g || !h) return { card: { kicker, title: loading ? 'Lighting the board\u2026' : 'Pachinko', body: 'Quirk switches the cabinet on.', buttons: ['GOODBYE'] } };
      if (h.phase === 'menu') return { card: { kicker, title: 'Fox Gate Pachinko', body: 'Hold SHOOT to fire balls up the board. Land them in the start pocket to spin the reels. Three of a kind opens the gate.',
        buttons: ['FREE PLAY \u00b7 200 BALLS', 'PLAY FOR GOLD \u00b7 BANK ' + (h.bank || 0), 'GOODBYE'] } };
      if (h.phase === 'done' && h.done) { const d = h.done; return { card: { kicker: d.kicker || kicker, title: d.title || 'Out of balls', mood: (d.sub || '') + (d.grade ? ' \u00b7 GRADE ' + d.grade : ''),
        notes: [(d.totalLbl || 'BALLS PAID') + ' \u00b7 ' + (d.total != null ? d.total : h.paid)].concat((d.rows || []).slice(0, 4).map(r => r[0] + ' \u00b7 ' + r[1])), buttons: ['PLAY AGAIN', 'BACK TO THE MENU', 'GOODBYE'] } }; }
      const f = h.fever, state = f ? 'FEVER ' + f.round + ' / ' + f.rounds : h.rush ? 'RUSH \u00b7 ' + h.rush : h.spinning ? (h.reach ? 'REACH!' : 'SPIN') : h.holds ? 'HOLDS \u00b7 ' + h.holds : 'READY';
      const stats = [['Balls', String(h.tray), h.tray < 20 ? '#ec3013' : null], ['Power', Math.round(h.power * 100) + '%'], [gold() ? 'Gold' : 'Paid', gold() ? String(h.gold) : String(h.paid || 0)], ['Board', state, f || h.rush ? '#ffd23a' : null]];
      const say = h.flash ? h.flash.txt : h.tip || (gold() && !h.tray ? 'OUT OF BALLS \u00b7 2 BUY 50 FOR 10 G' : 'HOLD 1 TO SHOOT \u00b7 \u25c0 \u25b6 POWER');
      const pad = gold() ? [{ k: 1, label: 'SHOOT', sub: 'HOLD' }, { k: 2, label: 'BUY 50', sub: '10 G' }, { k: 3, label: 'CASH OUT', sub: '6 BALLS = 1 G' }]
        : [{ k: 1, label: 'SHOOT', sub: 'HOLD' }, { k: 2, label: h.auto ? 'AUTO ON' : 'AUTO', sub: h.auto ? 'TAP TO STOP' : 'HANDS FREE' }];
      return { stats, showStats: true, where: say, pad, sticks: [['\u25c0', 'LESS', -1, 0], ['\u25b6', 'MORE', 1, 0]] }; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /GOODBYE/.test(b)) return 'leave'; if (!g) return;
      try { if (/MENU/.test(b)) g.toMenu(); else if (/GOLD/.test(b)) g.start('gold'); else if (/AGAIN/.test(b)) { g.toMenu(); g.start(h && h.mode === 'gold' ? 'gold' : 'free'); } else g.start('free'); h = g.hud(); } catch (e) { console.warn(e); } },
  };
}
