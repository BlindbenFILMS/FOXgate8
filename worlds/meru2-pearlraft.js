// MERU 2.0 — s183 MARLO'S PEARL RAFT on Pearl Island's Deep Pond (Ben: "the raft the pearl diver stands on · the pearl diver fox
// on the raft, give him a name + lines · swim to the raft OR the raft moves from the shore to the middle · he YELLS 'HELP ME DIVE
// FOR PEARLS' when you are in range"). Replaces the shore diver + the pond DIVE spots (LAKE.island.raft in meru2-layout.js).
// The raft docks at the shore by the diving board: E · BOARD THE RAFT = it poles out to the middle with you on it. Or swim out:
// E · CLIMB ONTO THE RAFT. On the raft: MARLO's menu (YES, PUT ME TO WORK! = the dive · HOW DOES IT WORK? · BACK TO SHORE ·
// GOODBYE). The dive itself is still Meru Pearl Dive (panel) until part B runs it in the world under the pond.
// Contract (meru2-walk.js, chained into news): prompt, talk, tick, toast, busy (never), camFix (none) + groundAt (castle wrap).
import { PLAYER_MALE } from '../fox-kit.js?v=s673';

export function buildPearlRaft({ THREE, scene, kit, L, save, sayTo, touch = false, audio = () => null, openDive = () => {}, go }) {
  // s184 PEARL VALLEY (L.ISLAND.crater): the raft is moored for good on the crater lake, over the dive map's own boat spot (engine 0, 0), at the end of a
  // short plank jetty off the beach the two lantern paths come down to. Marlo's YES runs the dive IN THE WORLD (walk.pearlWorld via FOXGATE8).
  const I = L.ISLAND, CR = I.crater || null, k = I.k || 1, PR = I.pond.r * k, C0 = CR ? CR.raft.slice() : [I.pond.x, I.pond.z];
  const dv = L.SPEAKERS.find(s => s.key === 'pearlDiver'), da = dv && !CR ? Math.atan2(dv.at[1] - C0[1], dv.at[0] - C0[0]) : Math.PI / 2;
  const HW = 2.3, WATER = CR ? CR.Hs : 0.4, DECK = WATER + 0.38, SHORE = CR ? C0.slice() : [C0[0] + Math.cos(da) * (PR - HW - 0.6), C0[1] + Math.sin(da) * (PR - HW - 0.6)], MID = [C0[0], C0[1]];
  const R = { x: SHORE[0], z: SHORE[1], yaw: CR ? 0 : da + Math.PI / 2, at: CR ? 'moored' : 'shore', to: null, t: 0, from: null };
  const JY = WATER + 0.5, JX = CR ? [C0[0] + HW - 0.1, CR.beach[0] - 1.3] : null, JW = 0.8, onJetty = (x, z) => !!JX && x > JX[0] && x < JX[1] && Math.abs(z - C0[1]) < JW;
  const flag = k0 => { try { return !!save.flag(k0); } catch (e) { return false; } };
  const tm = c => new THREE.MeshToonMaterial({ color: c });
  // ---------- the raft ----------
  const G = new THREE.Group(); G.name = 'pearlRaft'; scene.add(G);
  const add = (geo, m, x, y, z, par = G) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = !touch; o.receiveShadow = true; par.add(o); return o; };
  const LOG = [tm('#8a6a48'), tm('#a07a52')], ROPE = tm('#c9a24a'), INK = tm('#201e1d');
  for (let i = -3; i <= 3; i++) { const lg = add(new THREE.CylinderGeometry(0.34, 0.34, HW * 2, 10), LOG[(i + 3) % 2], i * 0.66, WATER + 0.12, 0); lg.rotation.x = Math.PI / 2; }
  for (const z of [-HW + 0.4, 0, HW - 0.4]) add(new THREE.BoxGeometry(HW * 2 + 0.2, 0.1, 0.3), tm('#6b4a35'), 0, DECK - 0.05, z);
  for (const z of [-HW + 0.4, HW - 0.4]) add(new THREE.TorusGeometry(0.36, 0.05, 5, 10), ROPE, -HW + 0.25, WATER + 0.12, z).rotation.y = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), INK, HW - 0.35, DECK + 1.7, -HW + 0.35);
  const flagM = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 144; const g = c.getContext('2d'); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 256, 144); g.fillStyle = '#ffffff'; g.font = '900 46px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PEARLS', 14, 74, 228); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() }));
  flagM.position.set(HW - 0.35 + 0.58, DECK + 3.0, -HW + 0.35); G.add(flagM);
  add(new THREE.CylinderGeometry(0.42, 0.34, 0.5, 12), tm('#c9b48a'), -1.3, DECK + 0.25, 1.3);
  for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffe9a0' : '#ffffff' }), -1.3 + (i - 2) * 0.1, DECK + 0.53, 1.3 + (i % 2) * 0.08);
  add(new THREE.BoxGeometry(0.8, 0.5, 0.6), tm('#7a5236'), -1.6, DECK + 0.25, -1.4);
  const pole = add(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 6), tm('#a07a52'), 0, 0, 0); pole.visible = false;
  // the plank jetty from the beach (valley mode): planks, side posts down to the lake floor, a lantern each end, a name board at the beach end
  const JG = new THREE.Group(); JG.name = 'pearlJetty'; if (JX) { scene.add(JG); const len = JX[1] - JX[0], PL = tm('#9a7650'), POST = tm('#5c4430'), lampM = new THREE.MeshBasicMaterial({ color: '#ffd9a0' });
    for (let x = JX[0] + 0.25; x < JX[1]; x += 0.55) add(new THREE.BoxGeometry(0.48, 0.08, JW * 2), PL, x, JY - 0.04, C0[1], JG);
    for (let x = JX[0] + 0.4; x < JX[1]; x += 2.4) for (const s of [-1, 1]) { const fl = L.craterFloorW ? L.craterFloorW(x, C0[1] + s * (JW - 0.08)) : WATER - 3, h = Math.max(0.6, JY - fl + 0.4); add(new THREE.CylinderGeometry(0.09, 0.09, h, 6), POST, x, JY - h / 2 + 0.35, C0[1] + s * (JW - 0.08), JG); }
    for (const x of [JX[0] + 0.3, JX[1] - 0.3]) { add(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6), INK, x, JY + 1.0, C0[1] - JW + 0.05, JG); add(new THREE.BoxGeometry(0.28, 0.34, 0.28), lampM, x, JY + 2.1, C0[1] - JW + 0.05, JG); }
    const bt = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d'); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 512, 160); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 14, 160); g.fillStyle = '#ffffff'; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PEARL VALLEY', 34, 56, 460); g.fillStyle = '#ffd23a'; g.font = '800 34px Archivo, sans-serif'; g.fillText('MARLO\u2019S RAFT \u00b7 THE DEEP POND', 34, 116, 460); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
    const bx = JX[1] + 0.9, bz = C0[1] + JW + 1.4, by = L.islandWalk ? ((L.islandWalk(bx, bz) || {}).h ?? JY) : JY; for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), INK, bx, by + 1.1, bz + s * 0.9, JG);
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.7), new THREE.MeshBasicMaterial({ map: bt, side: THREE.DoubleSide })); bm.position.set(bx, by + 1.85, bz); bm.rotation.y = Math.PI / 2; bm.userData.isSign = true; JG.add(bm); }
  // ---------- MARLO ----------
  const ML = { x: 1.0, z: 1.0 };
  const marlo = kit.makeFox({ key: 'marlo', name: 'Marlo', torso: ['#f3f2f2', '#2e4a6b', '#16263c'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#c9b48a', furDark: '#7a5c38' }, mood: 'happy', gear: 'none' });
  marlo.position.set(ML.x, DECK, ML.z); G.add(marlo);
  const tk = { key: 'marlo', obj: marlo, name: 'Marlo', role: 'Pearl Diver', ry: 0, r: 3.2 };
  // the shout bubble
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(4, 4, 504, 100); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 100); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(60, 100); g.lineTo(90, 126); g.lineTo(110, 100); g.fill(); g.fillStyle = '#ec3013'; g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('HELP ME DIVE FOR PEARLS!', 26, 56, 460); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), depthTest: false, transparent: true }));
  bub.scale.set(4.4, 1.1, 1); bub.position.set(ML.x, DECK + 3.1, ML.z); bub.renderOrder = 9; bub.visible = false; G.add(bub);
  // ---------- helpers ----------
  let toastS = '', toastT = 0; const toast = (s, t = 2.6) => { toastS = s; toastT = t; };
  const tone = (f, d, v, type = 'triangle') => { const c = audio(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d + 0.02); };
  const cs = () => Math.cos(R.yaw), sn = () => Math.sin(R.yaw);
  const toLocal = (x, z) => { const dx = x - R.x, dz = z - R.z; return [dx * cs() - dz * sn(), dx * sn() + dz * cs()]; };
  const toWorld = (lx, lz) => [R.x + lx * cs() + lz * sn(), R.z - lx * sn() + lz * cs()];
  const onDeckXZ = (x, z, m = 0) => { const [lx, lz] = toLocal(x, z); return Math.abs(lx) < HW + m && Math.abs(lz) < HW + m; };
  const onRaft = P => !!P && onDeckXZ(P.x, P.z, 0.1) && Math.abs(P.y - DECK) < 0.35;
  const deckSpot = (lx = -0.6, lz = -0.4) => { const [x, z] = toWorld(lx, lz); return [x, z]; };
  function sail(to) { if (R.to || R.at === to) return; R.to = to; R.from = [R.x, R.z]; R.t = 0; R.at = null; tone(220, 0.25, 0.04, 'sine'); }
  // ---------- MARLO's lines (box ≤ 20 words; first choice YES, PUT ME TO WORK! · last GOODBYE) ----------
  const N = t => ({ who: 'npc', text: t }), Y = t => ({ who: 'player', text: t });
  const menu = first => ({ who: 'npc', text: first ? (CR ? 'I\u2019m Marlo. Hull pearls lie all over this valley lake. Help me bring them up?' : 'I\u2019m Marlo. Hull pearls sit on the pond floor. Help me bring them up?') : 'Back for more pearls? The clams have opened again.', choices: [
    { text: 'YES, PUT ME TO WORK!', pick: () => { try { save.setStat('marloDives', (save.stat('marloDives', 0) || 0) + 1); } catch (e) {} sayTo(tk, [N('Deep breath. Off you go!')], () => openDive(), true); } },
    { text: 'HOW DOES IT WORK?', pick: () => sayTo(tk, [Y('How does it work?'), N('Dive off the raft. 2 goes down, 3 comes up. Grab pearls, bring them here.'), N('Watch your air. And if you see Nelly, swim the other way.'), menu(false)]) },
    ...(CR ? [] : [{ text: R.at === 'shore' ? 'TAKE US OUT TO THE MIDDLE' : 'BACK TO SHORE, PLEASE', pick: () => { const to = R.at === 'shore' ? 'mid' : 'shore'; sayTo(tk, [N(to === 'mid' ? 'Hold on. Out we go.' : 'Hold on. Back to the beach.')], () => sail(to), true); } }]),
    { text: 'GOODBYE', bye: true, pick: () => sayTo(tk, [N('The raft\u2019s here whenever you are.')]) }] });
  function talkMarlo() { const first = !flag('marloMet'); if (first) save.setFlag('marloMet'); sayTo(tk, [menu(first)]); }
  // ---------- per frame ----------
  let tA = 0, shoutCd = 4, shoutT = 0, inRange = false, last = null;
  function tick(dt, P) { tA += dt; toastT = Math.max(0, toastT - dt); last = P;
    const dc = Math.hypot(P.x - C0[0], P.z - C0[1]); G.visible = JG.visible = dc < (touch ? 110 : 160); if (!G.visible) return;
    // sail (smooth, ~7 s), carry the player
    if (R.to) { const ride = onRaft(P), ox = R.x, oz = R.z, tgt = R.to === 'mid' ? MID : SHORE; R.t = Math.min(1, R.t + dt / 7); const e = R.t * R.t * (3 - 2 * R.t);
      R.x = R.from[0] + (tgt[0] - R.from[0]) * e; R.z = R.from[1] + (tgt[1] - R.from[1]) * e; if (ride) { P.x += R.x - ox; P.z += R.z - oz; }
      if (R.t >= 1) { R.at = R.to; R.to = null; tone(330, 0.2, 0.04, 'sine'); if (ride) toast(R.at === 'mid' ? 'THE MIDDLE OF THE DEEP POND' : 'BACK AT THE SHORE', 2); } }
    const bob = Math.sin(tA * 1.3) * 0.04; G.position.set(R.x, bob, R.z); G.rotation.set(Math.sin(tA * 0.9) * 0.012, R.yaw, Math.sin(tA * 1.1) * 0.012);
    flagM.rotation.y = Math.sin(tA * 2.2) * 0.25;
    // Marlo: looks at you when close, shouts when you come into range (once per approach, then every 40 s)
    const [mx, mz] = toWorld(ML.x, ML.z), dm = Math.hypot(P.x - mx, P.z - mz); const want = dm < 14 ? Math.atan2(P.x - mx, P.z - mz) - R.yaw : -Math.PI / 2;
    marlo.rotation.y += Math.atan2(Math.sin(want - marlo.rotation.y), Math.cos(want - marlo.rotation.y)) * Math.min(1, dt * 4); tk.ry = marlo.rotation.y; kit.animFox(marlo, dt, 0, false);
    const near = dm < 28 && !onRaft(P); shoutCd -= dt;
    if (near && shoutCd <= 0) { shoutT = 3.6; shoutCd = 40; toast('MARLO: HELP ME DIVE FOR PEARLS!', 3); tone(660, 0.12, 0.05, 'square'); setTimeout(() => tone(880, 0.16, 0.05, 'square'), 140); marlo.userData.hop = 1; }
    if (!near && inRange) shoutCd = Math.min(shoutCd, 6); inRange = near;
    shoutT = Math.max(0, shoutT - dt); bub.visible = shoutT > 0; if (bub.visible) bub.material.opacity = Math.min(1, shoutT / 0.4); }
  // ---------- prompts + E ----------
  function spot(P) { if (!G.visible || R.to) return null;
    if (onRaft(P)) { const [mx, mz] = toWorld(ML.x, ML.z); if (Math.hypot(P.x - mx, P.z - mz) < 3.2) return { p: 'TALK \u00b7 MARLO', use: talkMarlo }; return null; }
    if (P.swim && onDeckXZ(P.x, P.z, 2.2)) return { p: 'CLIMB ONTO THE RAFT', use: () => { const [x, z] = deckSpot(); go(x, DECK, z, R.yaw); tone(500, 0.1, 0.04); } };
    if (!CR && !P.swim && P.y > -1 && P.y < 4) { const dS = Math.hypot(P.x - SHORE[0], P.z - SHORE[1]);
      if (R.at === 'shore' && dS < HW + 3.6) return { p: 'BOARD THE RAFT', use: () => { const [x, z] = deckSpot(); go(x, DECK, z, R.yaw); setTimeout(() => sail('mid'), 400); } };
      if (R.at === 'mid' && dS < HW + 3.6) return { p: 'CALL THE RAFT', use: () => { sail('shore'); toast('MARLO: COMING!', 2); } }; }
    return null; }
  return { prompt: P => { const s = spot(P); return s ? s.p : null; }, talk: P => { const s = spot(P); if (!s) return false; s.use(); return true; }, tick, busy: () => null, camFix() {}, toast: () => (toastT > 0 ? toastS : ''), quit() {}, useItem: () => false,
    groundAt: (x, z, y) => (G.visible && y > DECK - 1.0 && y < DECK + 2.5 && onDeckXZ(x, z, -0.05) ? DECK + G.position.y : JX && G.visible && y > JY - 1.2 && y < JY + 2.5 && onJetty(x, z) ? JY : null), onRaft,
    deckSpot: () => { const [x, z] = deckSpot(); return [x, DECK, z, CR ? Math.PI / 2 : R.yaw]; }, crater: !!CR, state: () => ({ at: R.at, to: R.to, x: R.x, z: R.z }), sail, SHORE, MID };
}
