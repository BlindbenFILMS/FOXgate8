// 8 GATES · SPACE MAP · EXPLORATION (s605, Ben's picks; from the 2D chartEdge / checkKnownSpace / buoyReached / claimBuoy / buoyRent /
// DEEP_RINGS / surveyWorld). 2D units × 0.12 (KNOWN_EDGE 6800 → 816 u).
// · THE CHARTED EDGE: a faint dashed blue ring at 816 u + "THE CHARTED EDGE" labels. LEAVING / RE-ENTERING KNOWN SPACE (31 u hysteresis),
//   DEEP SPACE — NO DEPOTS BEYOND past 1140 u.
// · BUOY CARD (the 2D "A BUOY IS PROPERTY"): lighting a buoy opens its card (log page, transponder SWEEP 552 u puts wrecks / lights /
//   pirate bases / uncharted worlds on your chart, the NEXT LIGHT bearing + SET COURSE, CLAIM IT). A claimed light pays 3 G / min (Ben).
//   8 of the 20 are held by the nearest world: taking one = 2 kills on their tally; 3 lights from one world = WAR (fleets.declare).
//   A light held by a world you are at war with is LOCKED (no log, no sweep) until you take it. Holding station within 36 u of a lit,
//   answering light tops up your cells. Bait lights spring "THE LIGHT WAS BAIT" (3 hulls) when you close the card.
// · UNCHARTED WORLDS: IONA / QOM / ERIDU / CUSCO / EARTH show as UNCHARTED WORLD inside a dashed blue ring until surveyed; flying within
//   300 u calls "UNCHARTED WORLD · BRG ###". Survey = +60 G, NAME IT box with the sacred name filled in (Earth keeps its name:
//   "IT WAS ALREADY NAMED. SOMEBODY WAS HERE FIRST"). All five = THE FRONTIER IS CHARTED.
// · DEEP PATROLS: raider wings on 4 rings past the edge (scouts inside → gunners + cruisers out where the ports are, tougher further
//   out). A wing only exists while you are within 420 u of it, turns on you inside 200 u, and is back 5 min after you break it.
// Saved in space.finds.v1: bOwn, bTaken, bPage, bSwept, seen, sprung, frontierDone.
import { KNOWN_EDGE, BUOY_NOTES, FRONTIER, WORLDS } from './space-galaxy.js?v=s441';
const TAU = Math.PI * 2, S = KNOWN_EDGE / 6800;
const DEEP_SPACE = 9500 * S, SWEEP = 4600 * S, BUOY_DOCK = 36, PAY_EVERY = 20, WAR_AT = 3, HYST = 260 * S, CALL_R = 300;
const RINGS = [
  { at: KNOWN_EDGE + 900 * S, wings: 3, size: 2, mix: ['scout', 'scout', 'fighter'], k: 1 },
  { at: KNOWN_EDGE + 2600 * S, wings: 3, size: 2, mix: ['fighter', 'fighter', 'gunner'], k: 1.25 },
  { at: KNOWN_EDGE + 4400 * S, wings: 2, size: 3, mix: ['gunner', 'fighter', 'fighter'], k: 1.5 },
  { at: KNOWN_EDGE + 6200 * S, wings: 2, size: 3, mix: ['fighter', 'gunner', 'gunner'], k: 1.8 },
];
const brgOf = (fx, fz, tx, tz) => String(Math.round((Math.atan2(tx - fx, -(tz - fz)) * 180 / Math.PI + 360) % 360)).padStart(3, '0');

export function createExplore(X) {
  const { THREE, scene, label, deep, fleets, combat, St, toast, burst, save, snd, nameOf, setCourse, bodies, V = 20, LOW } = X;
  const F = deep.F, saveF = deep.saveF;
  if (!F.bTaken || typeof F.bTaken !== 'object') F.bTaken = {}; if (!F.bPage || typeof F.bPage !== 'object') F.bPage = {};
  for (const k of ['bSwept', 'seen', 'sprung', 'spotted']) if (!Array.isArray(F[k])) F[k] = [];
  const buoys = deep.finds.filter(it => it.kind === 'buoy');
  const docked = WORLDS.filter(w => w.dock && !w.player);
  const wName = k => { const w = WORLDS.find(q => q.key === k); return (nameOf(k) || (w && w.name) || k).toUpperCase(); };
  if (!F.bOwn || typeof F.bOwn !== 'object') { F.bOwn = {}; let n = 0;   // 2D: eight of them are already somebody's
    for (const it of buoys.slice().sort((a, b) => a.id < b.id ? -1 : 1)) { if (it.primer || it.bait || it.id === 'buoy_first') continue; if (n++ % 2) continue; if (Object.keys(F.bOwn).length >= 8) break;
      let b = null, bd = 1e9; for (const w of docked) { const d = Math.hypot(w.x - it.x, w.z - it.z); if (d < bd) { bd = d; b = w; } } if (b) F.bOwn[it.id] = b.key; }
    saveF(); }
  const ownOf = it => F.bOwn[it.id] || null;
  const lockedOf = it => { const o = ownOf(it); return !!o && o !== '8g' && fleets.atWar(o); };
  const subOf = it => { const o = ownOf(it); if (!it.lit) return o ? wName(o) + ' LIGHT · UNLIT' : 'UNLIT BUOY'; return o === '8g' ? 'YOURS · 3 G / MIN' : o ? wName(o) + ' LIGHT' + (fleets.atWar(o) ? ' · LOCKED' : '') : 'LIT · UNCLAIMED'; };
  const relabel = it => { if (!it.lab) return; const p = it.lab.position.clone(); deep.unlabelFn(it.lab); it.lab = label(it.name, subOf(it), '#ffffff', ownOf(it) === '8g' ? '#6ee7b7' : '#ffd23a', 0.62, 300); it.lab.position.copy(p); };
  buoys.forEach(it => { if (ownOf(it) || it.lit) relabel(it); });

  // ---------- dashed rings (quads; a 1 px line is too faint for Ben) ----------
  function dashRing(R, n, w, col, op, y) { const P = [], I = []; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = a0 + TAU / n * 0.55;
      for (const [a, r] of [[a0, R - w], [a0, R + w], [a1, R - w], [a1, R + w]]) P.push(Math.cos(a) * r, y, Math.sin(a) * r); const b = i * 4; I.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I);
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); }
  const edge = dashRing(KNOWN_EDGE, LOW ? 160 : 240, 1.6, '#7fd0ff', 0.42, -3); scene.add(edge);
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.PI / 4, l = label('THE CHARTED EDGE', 'LIMIT OF THE FOX SURVEY', '#7fd0ff', '#ffffff', 1.1, 460); l.position.set(Math.cos(a) * (KNOWN_EDGE + 14), 1, Math.sin(a) * (KNOWN_EDGE + 14)); }
  const frRings = {};
  for (const w of FRONTIER) { const B = bodies.find(b => b.key === w.key); if (!B || F.surveyed.includes(w.key)) continue; const m = dashRing(B.r * 1.6, 48, 0.9, '#7fd0ff', 0.6, 0); m.position.set(B.x, -1, B.z); scene.add(m); frRings[w.key] = m; }

  // ---------- sweep fx ----------
  const sweeps = [];
  function sweepFx(x, z) { const m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 96), new THREE.MeshBasicMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.2, z); scene.add(m); sweeps.push({ m, r: 4 }); }
  function sweep(it) { let n = 0; const near = (x, z) => Math.hypot(x - it.x, z - it.z) <= SWEEP;
    for (const g of deep.finds) { if (g === it || g.done || g.lit || F.seen.includes(g.id)) continue; const gx = g.e ? g.e.x : g.x, gz = g.e ? g.e.z : g.z; if (near(gx, gz)) { F.seen.push(g.id); n++; } }
    for (const b of deep.bases) if (!b.razed && !b.known && near(b.x, b.z)) { b.known = true; if (!F.known.includes(b.name)) F.known.push(b.name); n++; }
    for (const w of FRONTIER) { const B = bodies.find(q => q.key === w.key); if (B && !F.surveyed.includes(w.key) && !F.spotted.includes(w.key) && near(B.x, B.z)) { F.spotted.push(w.key); n++; } }
    if (!F.bSwept.includes(it.id)) F.bSwept.push(it.id); saveF(); sweepFx(it.x, it.z); snd('buoy', { v: 0.4 }); return n; }
  const marksNear = it => deep.finds.filter(g => g !== it && !g.done && Math.hypot((g.e ? g.e.x : g.x) - it.x, (g.e ? g.e.z : g.z) - it.z) <= SWEEP).length + deep.bases.filter(b => !b.razed && Math.hypot(b.x - it.x, b.z - it.z) <= SWEEP).length;
  function nextLight(it) { let b = null, bd = 1e9; for (const g of buoys) { if (g === it || g.lit) continue; const d = Math.hypot(g.x - it.x, g.z - it.z); if (d < bd) { bd = d; b = g; } } return b ? { it: b, d: Math.round(bd), brg: brgOf(it.x, it.z, b.x, b.z) } : null; }

  // ---------- the card ----------
  function open(it, first, swept) { const own = ownOf(it), mine = own === '8g', locked = lockedOf(it), page = F.bPage[it.id] || 1, nx = locked ? null : nextLight(it);
    if (nx && !F.seen.includes(nx.it.id)) { F.seen.push(nx.it.id); saveF(); }
    const lines = [];
    if (locked) { lines.push(wName(own) + ' HOLDS THIS LIGHT, AND YOU ARE AT WAR WITH THEM.'); lines.push('Her transponder will not answer you. No log, no survey.'); lines.push('Cut their mark off her and she is yours: she will talk, and she will pay 3 G a minute.'); }
    else {
      lines.push(!first ? 'You have stood here before. ' + marksNear(it) + ' mark' + (marksNear(it) === 1 ? '' : 's') + ' inside her reach.' : swept ? 'Her transponder is still listening. ' + swept + ' new mark' + (swept === 1 ? '' : 's') + ' on your chart.' : 'Nothing new within her reach.');
      lines.push(nx ? 'The next light she can hear is BRG ' + nx.brg + ', ' + nx.d + ' u on.' : 'No unread light left.');
      lines.push(mine ? 'She is yours. 3 G a minute, for as long as you hold her.' : own ? wName(own) + ' holds this light and you are at peace with them, so she answers. Take her and she pays you instead. They will remember it, and three of their lights is a war.' : 'Nobody has claimed her. Put your mark on her and she pays 3 G a minute, for ever.'); }
    St.buoyCard = { id: it.id, name: it.name, log: locked ? '' : String(BUOY_NOTES[Math.min(page, BUOY_NOTES.length) - 1] || '').replace(/^LOG:\s*/, ''), kicker: 'SIGNAL BUOY · ' + (mine ? 'YOURS' : own ? wName(own) : 'UNCLAIMED'),
      lines, foot: locked ? '' : 'Page ' + page + ' of ' + BUOY_NOTES.length + ' · hold station here and her cells top up yours.', claim: mine ? null : (own ? 'Take' : 'Claim') + ' · 3 G / min', warn: !mine && own && !fleets.atWar(own) ? (F.bTaken[own] || 0) + 1 >= WAR_AT ? 'This is their third light. They will declare war.' : '' : '', next: nx ? 'Set course · next light · BRG ' + nx.brg : null };
    St.vx *= 0.3; St.vz *= 0.3; X.emit && X.emit(true); }
  function byId(id) { return buoys.find(b => b.id === id); }
  const API = {
    F,
    onBuoy(it) { F.bPage[it.id] = F.logs; saveF(); burst(it.x, it.z, '#ffe48a', 16, 1.2); snd('buoy', { v: 0.6 }); try { save.addXp(15); } catch (e) {} relabel(it);
      const swept = lockedOf(it) ? 0 : sweep(it); open(it, true, swept); },
    onRead(it) { open(it, false, 0); },
    claim() { const C = St.buoyCard, it = C && byId(C.id); if (!it) return; const was = ownOf(it), wasLocked = lockedOf(it); F.bOwn[it.id] = '8g'; snd('pickup');
      if (!was) toast('LIGHT CLAIMED · ' + it.name + ' · SHE PAYS 3 G PER MINUTE', 3.5);
      else { fleets.onKill(was); fleets.onKill(was); F.bTaken[was] = (F.bTaken[was] || 0) + 1; const n = F.bTaken[was];
        toast('LIGHT TAKEN FROM ' + wName(was) + ' · ' + n + '/' + WAR_AT + ' BEFORE THEY CALL IT', 4);
        if (n >= WAR_AT && !fleets.atWar(was) && !fleets.allied(was)) { fleets.declare(was); setTimeout(() => toast(wName(was) + ' HAS DECLARED WAR · Three of their lights was two too many.', 5), 1800); }
        else if (n === WAR_AT - 1) setTimeout(() => toast(wName(was) + ' has noticed: one more light and they will call it war.', 4.5), 1800); }
      saveF(); relabel(it); burst(it.x, it.z, '#6ee7b7', 14, 1);
      const sw = wasLocked || !F.bSwept.includes(it.id) ? sweep(it) : 0; open(it, wasLocked, sw); },
    course() { const C = St.buoyCard, it = C && byId(C.id), nx = it && nextLight(it); if (!nx) return; setCourse(nx.it.x, nx.it.z, nx.it.name + ' · LIGHT'); API.close(); },
    close() { const C = St.buoyCard, it = C && byId(C.id); St.buoyCard = null; X.emit && X.emit(true); if (!it || !it.bait || F.sprung.includes(it.id)) return; F.sprung.push(it.id); saveF();
      setTimeout(() => { const bear = Math.random() * TAU, R = 640 * S; ['scout', 'fighter', 'scout'].forEach((cl, i) => { const a = bear + (i - 1) * 0.7; combat.arenaShip && combat.arenaShip(cl, St.x + Math.cos(a) * R, St.z + Math.sin(a) * R); });
        snd('pirates'); toast('THE LIGHT WAS BAIT · AMBUSH · ' + it.name + ' WAS NEVER A MARKER · 3 HULLS', 4.5); }, 600); },
    prompt() { const z = St.zone; if (!z || z.kind !== 'find' || z.item.kind !== 'buoy' || !z.item.lit) return null; return 'Read ' + z.item.name; },
    // frontier
    uncharted: k => FRONTIER.some(w => w.key === k) && !F.surveyed.includes(k),
    onSurvey(w, fw) { const B = bodies.find(b => b.key === w.key); if (frRings[w.key]) { scene.remove(frRings[w.key]); delete frRings[w.key]; } try { save.addGold(60); } catch (e) {} snd('pickup');
      const brg = brgOf(0, 0, w.x, w.z);
      if (fw.key === 'earth') toast('EARTH · NEW WORLD CHARTED · BRG ' + brg + ' · ' + fw.trait.toUpperCase() + ' +60 G · IT WAS ALREADY NAMED. SOMEBODY WAS HERE FIRST', 7);
      else { toast('WORLD SURVEYED · ' + fw.trait.toUpperCase() + ' +60 G', 4); St.nameAsk = { key: w.key, frontier: true, kicker: 'New world charted · BRG ' + brg, title: 'Name this world', body: fw.trait + ' The old survey calls it ' + (nameOf(w.key) || fw.name) + '.', def: nameOf(w.key) || fw.name, later: 'Keep ' + (nameOf(w.key) || fw.name) }; }
      if (FRONTIER.every(q => F.surveyed.includes(q.key)) && !F.frontierDone) { F.frontierDone = 1; saveF(); setTimeout(() => toast('THE FRONTIER IS CHARTED · ALL FIVE FRONTIER WORLDS CHARTED · SETTLEMENT SURVEY COMPLETE', 6), 6000); }
      void B; },
    mini(x, tx, tz) { const k = x._k; x.save(); x.strokeStyle = 'rgba(127,208,255,0.6)'; x.lineWidth = 2; x.setLineDash([6, 6]); x.beginPath(); x.arc(tx(0), tz(0), KNOWN_EDGE * k, 0, TAU); x.stroke(); x.restore();
      for (const it of buoys) { if (!it.lit || ownOf(it) !== '8g') continue; x.fillStyle = '#6ee7b7'; const X0 = tx(it.x), Z0 = tz(it.z); x.beginPath(); x.moveTo(X0, Z0 - 5); x.lineTo(X0 + 4, Z0); x.lineTo(X0, Z0 + 5); x.lineTo(X0 - 4, Z0); x.fill(); }
      for (const w of wings) if (w.on) { x.strokeStyle = '#ff3a4a'; x.lineWidth = 2; x.strokeRect(tx(w.x) - 5, tz(w.z) - 5, 10, 10); } },
    seen: id => F.seen.includes(id),
  };

  // ---------- deep patrols ----------
  const wings = []; RINGS.forEach((R, ri) => { for (let i = 0; i < R.wings; i++) { const kinds = []; for (let k = 0; k < R.size; k++) kinds.push(R.mix[(k + i) % R.mix.length]);
    wings.push({ id: 'dw' + ri + '_' + i, R: R.at, a0: i / R.wings * TAU + ri * 0.7, om: (ri % 2 ? -1 : 1) * 6 / R.at, kinds, k: R.k, ships: [], on: false, down: 0, x: 0, z: 0 }); } });
  function wingTick(w, dt, free) { const a = w.a0 + w.om * (Date.now() / 1000 % 1e6); w.x = Math.cos(a) * w.R; w.z = Math.sin(a) * w.R; const d = Math.hypot(w.x - St.x, w.z - St.z);
    if (!w.on && free && d < 420 && Date.now() > w.down && !(combat.safeAt && combat.safeAt(w.x, w.z, 120))) { w.on = true; w.ships = w.kinds.map((cl, i) => { const p = combat.makeGuard(cl, w.x, w.z, 16, i / w.kinds.length * TAU, 0.5, w.id); p.hp = Math.round(p.C.hp * w.k); p.guard.war = () => true; return p; }); }
    if (!w.on) return; w.ships = w.ships.filter(p => !p.dead); for (const p of w.ships) { p.guard.cx = w.x; p.guard.cz = w.z; }
    if (!w.ships.length) { w.on = false; w.down = Date.now() + 5 * 60 * 1000; if (d < 300) setTimeout(() => toast('WING BROKEN · the ring is quiet here for a while.', 3), 1200); return; }
    if (d > 640 || !free) { w.ships.forEach(p => combat.removeShip(p)); w.ships = []; w.on = false; } }

  // ---------- tick ----------
  let out = null, deepF = false, payT = 0, chargeId = null; const called = new Set();
  API.update = (dt) => { const free = St.phase === 'free', r = Math.hypot(St.x, St.z);
    if (out === null) { out = r > KNOWN_EDGE; deepF = r > DEEP_SPACE; }
    else if (free) { if (!out && r > KNOWN_EDGE) { out = true; toast('LEAVING KNOWN SPACE · CROSSED THE CHARTED EDGE', 3.5); snd('menu'); }
      else if (out && r < KNOWN_EDGE - HYST) { out = false; deepF = false; toast('RE-ENTERING KNOWN SPACE · BACK INSIDE THE CHARTED EDGE', 3.5); snd('menu'); }
      if (out && !deepF && r > DEEP_SPACE) { deepF = true; toast('DEEP SPACE — NO DEPOTS BEYOND', 4); } }
    edge.material.opacity = 0.32 + 0.12 * Math.sin(St.t * 1.3);
    for (const k in frRings) frRings[k].rotation.y += dt * 0.08;
    for (let i = sweeps.length - 1; i >= 0; i--) { const s = sweeps[i]; s.r += 140 * dt; s.m.scale.setScalar(s.r); s.m.material.opacity = 0.6 * Math.max(0, 1 - s.r / (SWEEP + 50)); if (s.r > SWEEP + 50) { scene.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); sweeps.splice(i, 1); } }
    if ((payT += dt) >= PAY_EVERY) { payT = 0; const n = buoys.filter(b => b.lit && ownOf(b) === '8g').length; if (n) { try { save.addGold(n); } catch (e) {} if (!St.toast && free) toast('+' + n + ' G · ' + n + ' LIGHT' + (n === 1 ? '' : 'S'), 1.4); } }
    let ch = null; if (free && Math.hypot(St.vx, St.vz) < V * 0.5) for (const b of buoys) if (b.lit && !lockedOf(b) && Math.hypot(b.x - St.x, b.z - St.z) < BUOY_DOCK) { ch = b; break; }
    if (ch && St.en < 100) { St.en = Math.min(100, St.en + 6 * dt); if (chargeId !== ch.id) { chargeId = ch.id; toast('RECHARGING · ' + ch.name + ' tops up your cells.', 2.4); } } else if (!ch) chargeId = null;
    if (free) for (const w of FRONTIER) { if (F.surveyed.includes(w.key) || called.has(w.key)) continue; const B = bodies.find(q => q.key === w.key); if (B && Math.hypot(B.x - St.x, B.z - St.z) - B.r < CALL_R) { called.add(w.key); if (!F.spotted.includes(w.key)) { F.spotted.push(w.key); saveF(); } toast('UNCHARTED WORLD · BRG ' + brgOf(St.x, St.z, B.x, B.z) + ' · slow down over it to survey', 4); snd('botAim', { v: 0.5 }); } }
    for (const w of wings) wingTick(w, dt, free && !X.arena());
    if (St.buoyCard && free) { St.vx *= Math.exp(-dt * 3); St.vz *= Math.exp(-dt * 3); }
  };
  API.wings = wings;
  return API;
}
