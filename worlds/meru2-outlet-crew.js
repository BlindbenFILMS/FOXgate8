// MERU 2.0 — s154 THE OUTLETS REPAIR CREW (Ben's picks s154): after all 5 Outlets stores are cleared (4 lieutenants + Magpie), DOZER
// (huge gentle fox, dusty overalls, yellow hard hat, hums) parks his crew truck at the west end of the strip. Crew: the MASTER CARPENTER,
// DOT DIESEL (wires), SPRITZ (pipes), GUARD BRICK (cement). ONE STORE PER GAME DAY (meru2Day; sleep = next day): pick a store, the crew walks
// over, scaffolding + cones go up, and the 6 jobs (all 6, every store) wait in yellow rings on its forecourt:
//   CARPENTER (nail the new boards) · ELECTRICIAN (wire by colour) · PLUMBER (turn pipes, stop the leak) · CEMENT (pour + smooth) · SWEEP (broom the
//   mess into the pan) · HANG THE NEW SIGN (drop on the hooks, bolt it level). Each finished job SHOWS on the store (new front, lights, pipe, slab,
//   clean forecourt + inside, sign). All 6 = the store is fixed ("OPENING SOON", inside damage gone). All 5 = HARD HAT CREW outfit + TOOL BELT.
// Talk: Dozer + each helper have 1-on-1 menus (YES, PUT ME TO WORK! first, GOODBYE last) + proximity barks; after all 5, the helpers greet you in town.
// Stat outRepair { done, cur, jobs, lastDay, met, all, friend, best }. Test: ?start=crew · __crew.nextDay() · __crew.reset() · __crew.fix('sport').
import { CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { dressFox } from './meru2-roster.js';
import { HW } from './meru2-hardware.js';   // s161: the crew live at MERU HARDWARE (department heads) when they are not at an Outlets store
export function buildOutletCrew({ THREE, scene, kit, cols, save, touch, sayTo, wear, isMuted = () => false, L }) {
  const BLD = (L && L.BUILDINGS) || [];
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', STEEL = '#9aa0a6', WOOD = '#8b6a48';
  const STORES = [
    { key: 'sport', unit: 0, name: 'SPORTING GOODS', sub: 'GEAR \u00b7 TENTS \u00b7 BOATS', bg: '#2f7d5a', fg: '#ffffff', bar: YEL, wall: '#dfe7e0' },
    { key: 'tees', unit: 1, name: 'FUNNY T-SHIRTS', sub: 'WEAR YOUR JOKE', bg: '#c2456a', fg: '#ffffff', bar: YEL, wall: '#f1e2e6' },
    { key: 'gelato', unit: 2, name: 'GELATO', sub: 'TWENTY FLAVOURS', bg: '#f4b8c8', fg: INK, bar: RED, wall: '#fbf0f3' },
    { key: 'elec', unit: 3, name: 'ELECTRONICS', sub: 'TVS \u00b7 GAMES \u00b7 SOUND', bg: '#2e4a6b', fg: YEL, bar: RED, wall: '#dde2e9' },
    { key: 'furn', unit: 4, name: 'FURNITURE', sub: 'SOFAS \u00b7 BEDS \u00b7 LAMPS', bg: '#7a5236', fg: '#f6efe2', bar: YEL, wall: '#efe7db' }];
  for (const s of STORES) { const b = BLD.find(q => q.kind === 'outlet' && q.unit === s.unit); if (!b) return null; s.b = b; s.n = b.face === 'N' ? [0, -1] : [0, 1]; s.ax = [s.n[1], -s.n[0]];
    s.c = [(b.f[0] + b.f[1]) / 2, b.face === 'N' ? b.f[2] : b.f[3]]; s.W = b.f[1] - b.f[0]; s.th = Math.atan2(s.n[0], s.n[1]); s.w = (u, v) => [s.c[0] + s.ax[0] * u + s.n[0] * v, s.c[1] + s.ax[1] * u + s.n[1] * v]; }
  const SK = Object.fromEntries(STORES.map(s => [s.key, s]));
  const JOBS = [{ k: 'carp', name: 'CARPENTER', who: 'master', u: -6.5, v: 3.0 }, { k: 'elec', name: 'ELECTRICIAN', who: 'dot', u: 6.5, v: 3.0 }, { k: 'plumb', name: 'PLUMBER', who: 'spritz', u: -9.6, v: 5.6 },
    { k: 'cement', name: 'CEMENT', who: 'brick', u: 9.6, v: 5.6 }, { k: 'sweep', name: 'SWEEP UP', who: 'dozer', u: -3.0, v: 6.2 }, { k: 'sign', name: 'HANG THE SIGN', who: 'dozer', u: 3.0, v: 6.2 }];
  const JK = Object.fromEntries(JOBS.map(j => [j.k, j]));
  const SPOT = { master: [-5.2, 3.9], dot: [7.8, 3.9], spritz: [-8.3, 6.5], brick: [8.3, 6.5], dozer: [0.9, 7.1] }, HIRE = [-1.3, 7.3];
  const BASE = { dozer: [171.2, -307.6, -Math.PI / 2], master: [173.4, -308.6], dot: [175.0, -309.2], spritz: [176.6, -308.6], brick: [178.2, -309.2] }, BASEHIRE = [168.6, -305.6];
  // ================= state =================
  const day = () => save.stat('meru2Day', 1);
  const R0 = () => ({ done: {}, cur: null, jobs: {}, lastDay: 0, met: false, all: false, friend: {}, best: {}, sup: {}, supOK: false });
  const R = () => { const r = save.stat('outRepair', null); if (!r || typeof r !== 'object') return R0(); const o = { ...R0(), ...r }; if (r.cur && r.supOK == null) o.supOK = true; o.sup = o.sup || {}; return o; };   // s161: sup = the supply list picked up at Meru Hardware; old saves mid-store skip it
  const setR = r => save.setStat('outRepair', r);
  const prog = () => { try { if (window.__outlets) return window.__outlets.prog(); } catch (e) {} const p = save.stat('outletsProg', null) || {}; return { cleared: p.cleared || {}, magpie: !!p.magpie }; };
  const ready = () => { const p = prog(); return !!p.magpie && ['sport', 'tees', 'elec', 'furn'].every(k => p.cleared && p.cleared[k]); };
  const jobsOf = (s, r = R()) => (r.done[s.key] ? Object.fromEntries(JOBS.map(j => [j.k, true])) : r.cur === s.key ? r.jobs || {} : {});
  const nFixed = (r = R()) => STORES.filter(s => r.done[s.key]).length;
  // ================= geometry kit (one merged vertex-colour mesh per part: phone budget) =================
  const VCM = new THREE.MeshLambertMaterial({ vertexColors: true }), VCB = new THREE.MeshBasicMaterial({ vertexColors: true });
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 8, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z) => put(new THREE.SphereGeometry(r, 8, 5), x, y, z, hex),
      cone: (r, h, hex, x, y, z, rx = 0, rz = 0) => put(new THREE.ConeGeometry(r, h, 8), x, y, z, hex, 0, rx, rz),
      mesh(parent, mat = VCM) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, mat); m.userData.noCull = true; parent.add(m); return m; } }; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const fitTxt = (g, txt, max, size, wt = 900) => { let s = size; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > max && s > 10) { s -= 2; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; } };
  const board = (title, sub, bg, fg, bar, W = 1024, H = 160) => CT(W, H, (g) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = bar; g.fillRect(0, 0, 18, H); g.fillStyle = fg; g.textBaseline = 'alphabetic';
    fitTxt(g, title, W - 80, Math.round(H * 0.5)); g.fillText(title, 44, sub ? H * 0.6 : H * 0.68); if (sub) { fitTxt(g, sub, W - 80, Math.round(H * 0.19), 800); g.fillText(sub, 46, H * 0.88); } });
  const plane = (tex, w, h, x, y, z, ry, parent, basic = true) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshLambertMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; m.userData.noCull = true; parent.add(m); return m; };
  const crackT = CT(256, 256, (g, w, h) => { g.fillStyle = '#6f6b66'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.18) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    g.strokeStyle = '#1d1b1a'; g.lineCap = 'round'; for (let k = 0; k < 7; k++) { g.lineWidth = 2 + Math.random() * 5; g.beginPath(); let x = w / 2 + rnd(-30, 30), y = h / 2 + rnd(-30, 30); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += rnd(-46, 46); y += rnd(-46, 46); g.lineTo(x, y); } g.stroke(); } });
  const newSlabT = CT(256, 256, (g, w, h) => { g.fillStyle = '#cfccc5'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(32,30,29,.12)'; g.lineWidth = 3; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(rnd(0, w), rnd(0, h), rnd(20, 60), rnd(0, 3), rnd(3, 6)); g.stroke(); } g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); });
  // ---- debris piles (a different mess per store) ----
  const THEME = { sport: ['#e07a1f', '#f3f2f2', YEL, '#2f7d5a'], tees: ['#c2456a', '#2e86b8', YEL, '#f3f2f2'], gelato: ['#f4b8c8', '#bfe3c9', '#e9d27a', '#d7a86e'], elec: ['#bcd6e6', '#26292d', '#8a8f94', '#c9a27a'], furn: ['#6a3b5a', '#f3f2f2', '#a77b4f', '#d9c7a0'] };
  let seed = 7; const srnd = (a, b) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };
  function pile(M2, u, v, theme, sc = 1) { const C = THEME[theme]; for (let i = 0; i < 4; i++) M2.box(srnd(0.8, 1.8) * sc, 0.08, 0.22, ['#7a5c40', WOOD, '#9a7550'][i % 3], u + srnd(-0.6, 0.6), 0.06 + i * 0.07, v + srnd(-0.5, 0.5), srnd(0, 3), 0, srnd(-0.1, 0.1));
    for (let i = 0; i < 6; i++) M2.box(srnd(0.15, 0.4) * sc, srnd(0.1, 0.26), srnd(0.15, 0.35) * sc, ['#8a857e', '#6f6b66', '#a19c94'][i % 3], u + srnd(-0.9, 0.9), 0.08, v + srnd(-0.8, 0.8), srnd(0, 3));
    for (let i = 0; i < 5; i++) { const c = C[i % C.length], x = u + srnd(-1, 1), z = v + srnd(-0.9, 0.9);
      if (theme === 'sport') M2.sph(srnd(0.12, 0.2), c, x, 0.16, z); else if (theme === 'tees') M2.box(0.42, 0.05, 0.36, c, x, 0.05, z, srnd(0, 3)); else if (theme === 'gelato') { if (i % 2) M2.cone(0.08, 0.24, '#d7a86e', x, 0.08, z, Math.PI / 2, srnd(0, 3)); else M2.sph(0.11, c, x, 0.09, z); }
      else if (theme === 'elec') M2.box(0.4, 0.03, 0.3, c, x, 0.03, z, srnd(0, 3), 0, 0.2); else M2.box(0.5, 0.18, 0.5, c, x, 0.1, z, srnd(0, 3)); } }
  // ================= per-store dressing (local frame = town2's: origin on the front wall at the door, +z outward) =================
  const ON = (c, on) => { if (c) c.on = on; };
  const colBox = (s, u, v, hw, hd) => { const [x, z] = s.w(u, v), c = { f: [x - hw, x + hw, z - hd, z + hd], on: false }; cols.push(c); return c; };
  function dress(s) {
    const G = new THREE.Group(); G.name = 'crew_' + s.key; G.position.set(s.c[0], 0, s.c[1]); G.rotation.y = s.th; scene.add(G); s.G = G; const part = () => { const g = new THREE.Group(); G.add(g); return g; };
    const hw = s.W / 2, P = s.P = {}; seed = 11 + s.unit * 97;
    // SKIN (carpenter): fresh panels over the boarded front, door frame, window frames, awning, coping
    P.skin = part(); { const M2 = mk(); M2.box(hw - 1.5, 7, 0.12, s.wall, -(hw + 1.5) / 2, 3.5, 0.34); M2.box(hw - 1.5, 7, 0.12, s.wall, (hw + 1.5) / 2, 3.5, 0.34); M2.box(3, 4, 0.12, s.wall, 0, 5, 0.34);
      for (const sx of [-1, 1]) { M2.box(hw - 1.5, 0.36, 0.2, INK, sx * (hw + 1.5) / 2, 0.18, 0.42); M2.box(7.3, 0.14, 0.16, INK, sx * 6.1, 3.17, 0.44); M2.box(7.3, 0.14, 0.16, INK, sx * 6.1, 0.63, 0.44); for (const dx of [-3.6, 0, 3.6]) M2.box(0.14, 2.6, 0.16, INK, sx * 6.1 + dx, 1.9, 0.44); M2.box(0.16, 3.0, 0.22, INK, sx * 1.48, 1.5, 0.42); }
      M2.box(3.1, 0.18, 0.22, INK, 0, 3.0, 0.42); M2.box(s.W, 0.4, 1.2, s.bg, 0, 3.7, 0.95); M2.box(s.W, 0.1, 0.06, s.bar, 0, 3.46, 1.56); M2.box(s.W + 0.2, 0.22, 0.42, INK, 0, 7.06, 0.4); M2.mesh(P.skin); }
    s.winM = new THREE.MeshBasicMaterial({ color: '#2a3440' }); for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.4), s.winM); w.position.set(sx * 6.1, 1.9, 0.41); w.userData.noCull = true; P.skin.add(w); }
    const dM = new THREE.MeshLambertMaterial({ color: '#33414d' }); s.doors = [-1, 1].map(sx => { const d = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.85, 0.06), dM); d.position.set(sx * 0.7, 1.45, 0.38); d.userData.sx = sx; d.userData.noCull = true; P.skin.add(d); return d; }); s.doorOpen = 0;
    // LIGHTS (electrician): strip under the awning + 6 downlights
    P.lit = part(); { const M2 = mk(); M2.box(s.W - 1, 0.06, 0.08, '#fff2c4', 0, 3.47, 1.4); for (let i = 0; i < 6; i++) M2.box(0.3, 0.05, 0.3, '#fff2c4', -hw + 2 + i * (s.W - 4) / 5, 3.48, 0.9); M2.mesh(P.lit, VCB); }
    // SIGN (hang the sign)
    P.sign = part(); { const M2 = mk(); M2.box(12.4, 1.9, 0.16, INK, 0, 5.3, 0.44); M2.mesh(P.sign); s.signM = new THREE.MeshBasicMaterial({ map: board(s.name, 'OPENING SOON \u00b7 ' + s.sub, s.bg, s.fg, s.bar), color: 0x8a8a8a }); const m = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.6), s.signM); m.position.set(0, 5.3, 0.53); m.userData.noCull = true; P.sign.add(m); }
    if (s.unit === 0) { P.pylon = part(); const M2 = mk(); M2.box(0.6, 2.3, 7.2, INK, -hw - 1.2, 9.2, 2.2); M2.mesh(P.pylon); const t = board('MERU OUTLETS', 'FIVE STORES \u00b7 OPENING SOON', s.bg, s.fg, s.bar, 1024, 240); for (const sx of [-1, 1]) plane(t, 6.8, 1.9, -hw - 1.2 + sx * 0.31, 9.2, 2.2, sx * Math.PI / 2, P.pylon); }
    // JUNCTION BOX (always) + dangling wires (until the electrician)
    { const M2 = mk(); M2.box(0.8, 1.0, 0.26, '#6f747a', 9.6, 1.7, 0.55); M2.box(0.12, 3.6, 0.12, '#6f747a', 9.6, 4.4, 0.5); M2.mesh(part()); P.wires = part(); const W2 = mk(); W2.box(0.7, 0.9, 0.04, '#4a4f55', 10.2, 1.7, 0.95, 1.2);
      for (const [dx, c, l] of [[-0.25, RED, 0.9], [0, '#2e86b8', 0.7], [0.2, YEL, 1.1], [0.35, '#2f9a5e', 0.6]]) W2.box(0.04, l, 0.04, c, 9.6 + dx, 1.2 - l / 2 + 0.1, 0.72, 0, 0, dx * 0.6); W2.mesh(P.wires); }
    // DOWNPIPE: broken (until the plumber) / fixed
    P.pipeBad = part(); { const M2 = mk(); M2.cyl(0.1, 0.1, 4.2, '#5a5654', -10.6, 4.9, 0.55); M2.cyl(0.1, 0.1, 2.2, '#5a5654', -9.9, 0.12, 1.5, 8, Math.PI / 2, 0, 0.6); M2.cyl(1.2, 1.2, 0.02, '#5b8fb0', -10.1, 0.015, 1.7, 16); M2.mesh(P.pipeBad); }
    P.pipeOk = part(); { const M2 = mk(); M2.cyl(0.1, 0.1, 7, '#3d4a55', -10.6, 3.5, 0.55); M2.cyl(0.14, 0.1, 0.4, '#3d4a55', -10.6, 0.2, 0.7, 8, 0.6); for (const y of [1.5, 3.5, 5.5]) M2.box(0.3, 0.06, 0.2, INK, -10.6, y, 0.46); M2.mesh(P.pipeOk); }
    // SLAB: cracked (until the cement) / fresh
    P.slabBad = part(); { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshLambertMaterial({ map: crackT })); m.rotation.x = -Math.PI / 2; m.position.set(9.6, 0.02, 4.6); P.slabBad.add(m); const M2 = mk(); for (let i = 0; i < 4; i++) M2.box(srnd(0.3, 0.6), srnd(0.1, 0.22), srnd(0.3, 0.6), '#7d7872', 9.6 + srnd(-1.4, 1.4), 0.1, 4.6 + srnd(-1.4, 1.4), srnd(0, 3), srnd(-0.2, 0.2)); M2.mesh(P.slabBad); }
    P.slabOk = part(); { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshLambertMaterial({ map: newSlabT })); m.rotation.x = -Math.PI / 2; m.position.set(9.6, 0.02, 4.6); P.slabOk.add(m); }
    // DEBRIS outside + inside (until the sweep)
    P.debOut = part(); { const M2 = mk(); pile(M2, -6.8, 5.6, s.key); pile(M2, 4.6, 4.6, s.key, 0.8); pile(M2, -1.6, 4.9, s.key, 0.7); M2.mesh(P.debOut); }
    P.debIn = part(); { const M2 = mk(); pile(M2, -8, -4, s.key); pile(M2, 8, -9, s.key); pile(M2, -7.5, -16, s.key); pile(M2, 6.5, -18, s.key, 0.8); M2.mesh(P.debIn); }
    // SCAFFOLD + CONES + CREW AT WORK board (the store being fixed today)
    P.site = part(); { const M2 = mk(); const runs = [[-10.4, -6.2, -2.0], [6.2, 10.4]];
      for (const run of runs) { for (const u of run) for (const v of [1.7, 2.5]) M2.cyl(0.05, 0.05, 6.2, STEEL, u, 3.1, v, 6); const a = run[0], b = run[run.length - 1];
        for (const y of [2.6, 5.0]) { M2.box(b - a + 0.4, 0.06, 1.0, '#c9a27a', (a + b) / 2, y, 2.1); M2.box(b - a, 0.05, 0.05, STEEL, (a + b) / 2, y + 0.9, 2.5); }
        for (let i = 0; i < run.length - 1; i++) { const m = (run[i] + run[i + 1]) / 2, L2 = Math.hypot(run[i + 1] - run[i], 2.4); M2.box(L2, 0.05, 0.05, STEEL, m, 1.3, 2.5, 0, 0, Math.atan2(2.4, run[i + 1] - run[i])); M2.box(L2, 0.05, 0.05, STEEL, m, 3.8, 2.5, 0, 0, -Math.atan2(2.4, run[i + 1] - run[i])); } }
      for (let u = -10; u <= 10.1; u += 2.5) { if (Math.abs(u - HIRE[0]) < 1 || Math.abs(u - 0.9) < 0.8) continue; M2.cone(0.2, 0.6, '#ff7a1a', u, 0.3, 7.6); M2.box(0.42, 0.04, 0.42, INK, u, 0.02, 7.6); M2.box(0.24, 0.08, 0.02, PAPER, u, 0.36, 7.6 + 0.12, 0, -0.32); }
      M2.box(0.06, 1.2, 0.06, INK, HIRE[0] - 0.5, 0.6, HIRE[1]); M2.box(0.06, 1.2, 0.06, INK, HIRE[0] + 0.5, 0.6, HIRE[1]); M2.mesh(P.site);
      plane(board('NOW HIRING', 'REPAIR CREW \u00b7 TALK OR STEP IN', YEL, INK, RED, 512, 256), 1.2, 0.6, HIRE[0], 1.0, HIRE[1] + 0.05, 0, P.site);
      { const M3 = mk(), u = 5.6, v = 9.6; M3.box(1.8, 0.14, 1.3, '#a07a52', u, 0.07, v); for (let i = 0; i < 6; i++) M3.box(1.7, 0.1, 0.18, '#c9a27a', u, 0.2 + Math.floor(i / 3) * 0.1, v - 0.4 + (i % 3) * 0.2); for (let i = 0; i < 3; i++) M3.box(0.6, 0.2, 0.42, '#e7e4dc', u - 0.5 + i * 0.5, 0.5, v + 0.35);
        M3.cyl(0.25, 0.25, 0.3, WOOD, u + 0.55, 0.55, v - 0.25, 10, Math.PI / 2); for (let i = 0; i < 3; i++) M3.cyl(0.04, 0.04, 1.6, '#c98a4a', u, 0.47 + i * 0.08, v - 0.25, 6, 0, Math.PI / 2); M3.cyl(0.14, 0.14, 0.24, s.bg, u - 0.6, 0.47, v - 0.3, 10); M3.cyl(0.3, 0.22, 0.4, '#b0623f', u + 1.2, 0.2, v + 0.4, 10); M3.sph(0.32, '#3f9a5e', u + 1.2, 0.62, v + 0.4); M3.mesh(P.site); }
      plane(board('MERU HARDWARE', "ON DOZER'S TAB", RED, '#ffffff', YEL, 512, 160), 0.9, 0.28, 5.6, 0.45, 10.27, 0, P.site); }
    s.siteCols = [...[-10.4, -6.2, -2.0, 6.2, 10.4].map(u => colBox(s, u, 2.1, 0.12, 0.5)), colBox(s, 5.6, 9.6, 0.95, 0.7)];
    // OPENING SOON poster inside the front wall (the repaired store)
    P.poster = part(); plane(board('OPENING SOON', 'FRESHLY FIXED BY DOZER & CO.', s.bg, s.fg, s.bar, 1024, 256), 3.2, 0.8, -5, 2.4, -0.3, Math.PI, P.poster);
  }
  for (const s of STORES) dress(s);
  // ================= the crew truck + CREW WANTED board (west end of the strip) =================
  const BASEG = new THREE.Group(); BASEG.name = 'crewBase'; scene.add(BASEG);
  { const M2 = mk(), x0 = 175, z0 = -303.6; M2.box(5.2, 2.5, 2.3, '#e7e4dc', x0 + 0.8, 1.65, z0); M2.box(1.9, 1.9, 2.3, YEL, x0 - 2.6, 1.35, z0); M2.box(0.06, 0.8, 2.0, '#3a4a58', x0 - 3.56, 1.75, z0);
    for (const dx of [-2.6, 0, 2.4]) for (const dz of [-1.1, 1.1]) M2.cyl(0.42, 0.42, 0.3, '#151414', x0 + dx, 0.42, z0 + dz, 10, Math.PI / 2); M2.box(5.2, 0.12, 2.32, INK, x0 + 0.8, 0.44, z0);
    M2.box(4.6, 0.08, 0.08, STEEL, x0 + 0.8, 3.05, z0 - 0.5); M2.box(4.6, 0.08, 0.08, STEEL, x0 + 0.8, 3.05, z0 + 0.5); for (let i = 0; i < 9; i++) M2.box(0.06, 0.06, 1.0, STEEL, x0 - 1.4 + i * 0.55, 3.05, z0);
    M2.box(0.06, 1.2, 0.06, INK, BASEHIRE[0] - 0.5, 0.6, BASEHIRE[1]); M2.box(0.06, 1.2, 0.06, INK, BASEHIRE[0] + 0.5, 0.6, BASEHIRE[1]); M2.box(0.6, 0.5, 0.6, WOOD, 169.9, 0.25, -309.6); M2.cyl(0.07, 0.06, 0.14, PAPER, 169.9, 0.57, -309.6, 8); M2.mesh(BASEG);
    const T = board('DOZER & CO.', 'REPAIRS \u00b7 NO JOB TOO BIG', YEL, INK, RED, 1024, 240); plane(T, 4.6, 1.1, x0 + 0.8, 1.9, z0 - 1.17, Math.PI, BASEG); plane(T, 4.6, 1.1, x0 + 0.8, 1.9, z0 + 1.17, 0, BASEG);
    plane(board('CREW WANTED', 'DOZER \u00b7 MERU HARDWARE', YEL, INK, RED, 512, 256), 1.2, 0.6, BASEHIRE[0], 1.0, BASEHIRE[1] - 0.05, -Math.PI / 2, BASEG); }
  const truckCol = { f: [171.3, 178.7, -305, -302.2], on: false }; cols.push(truckCol); BASEG.visible = false;
  // ================= crew foxes =================
  const hardHat = (head, col = YEL) => { const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color: col }); const d = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); d.position.y = 0.24; d.scale.set(1, 0.9, 1.08); g.add(d);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 18), m); br.position.set(0, 0.25, 0.04); br.scale.set(1, 1, 1.15); g.add(br); const rd = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.42), m); rd.position.y = 0.46; g.add(rd); g.traverse(o => { o.renderOrder = 2; }); head.add(g); return g; };
  const CREWDEF = {
    dozer: { name: 'Dozer', role: 'MERU HARDWARE \u00b7 CREW BOSS', opts: { torso: ['#9a8a66', '#c9b48a', '#5a4c36'], outfit: 'vest', mood: 'warm', look: { fur: '#a0703f', furDark: '#6b4726', muzzle: '#efe2cc' } }, scale: 1.38, hat: h => hardHat(h) },
    // s161 (Ben): the crew are NEW foxes = the Meru Hardware department heads (internal keys kept so old saves keep their friend counts)
    master: { name: 'Hank Plank', role: 'LUMBER', opts: { torso: ['#a8322a', '#201e1d', '#5a1a14'], outfit: 'vest', mood: 'warm', look: { fur: '#c8642a', furDark: '#7a3a14', muzzle: '#f1e2cc' } }, scale: 1.12, hat: h => hardHat(h, PAPER) },
    dot: { name: 'Volta Vee', role: 'ELECTRICAL', opts: { torso: ['#ffd23a', '#201e1d', '#8a6a10'], outfit: 'vest', mood: 'happy', look: { fur: '#8a9aa8', furDark: '#5a6670', muzzle: '#f3f2f2', lashes: 1 } }, hat: h => hardHat(h, '#ffd23a') },
    spritz: { name: 'Gus Gasket', role: 'PLUMBING', opts: { torso: ['#2e4a6b', '#5b8fb0', '#1a2a3e'], outfit: 'coat', mood: 'neutral', look: { fur: '#9a7a5a', furDark: '#5e4630' } }, dress: ['cap', '#2e86b8'] },
    brick: { name: 'Morty Mortar', role: 'MASONRY', opts: { torso: ['#8a857e', '#c9c4bc', '#4a4642'], outfit: 'vest', mood: 'neutral', look: { fur: '#6b635b', furDark: '#3d3833', muzzle: '#d9d4cc' } }, hat: h => hardHat(h, '#ff7a1a') } };
  const CREW = {};
  function makeCrew() { if (CREW.dozer) return; for (const k in CREWDEF) { const D = CREWDEF[k], f = kit.makeFox({ key: 'crew_' + k, name: D.name, crest: '', ...D.opts }); if (D.scale) f.scale.multiplyScalar(D.scale);
      const P2 = f.userData.P; if (D.dress) dressFox(THREE, f, D.dress); if (D.hat && P2 && P2.head) D.hat(P2.head); if (P2 && P2.sword) P2.sword.visible = false; if (P2 && P2.gun) P2.gun.visible = false;
      f.userData.noCull = true; f.visible = false; scene.add(f); const b = BASE[k]; f.position.set(b[0], 0, b[1]); f.rotation.y = b[2] != null ? b[2] : Math.PI;
      const col = { f: [0, 0, 0, 0], on: false }; cols.push(col); CREW[k] = { k, D, f, tx: b[0], tz: b[1], face: f.rotation.y, show: true, col, bark: 0, hideAt: false, mode: 'home' }; setHome(CREW[k]); } }
  function setHome(c) { const h = HW.spot[c.k]; c.f.position.set(h[0], 0, h[1]); c.tx = h[0]; c.tz = h[1]; c.face = h[2]; c.f.rotation.y = h[2]; c.mode = 'home'; c.hideAt = false; c.show = true; }
  const crewT = k => { const c = CREW[k]; return { key: 'crew_' + k, name: c.D.name, role: c.D.role, obj: c.f, ry: c.f.rotation.y, r: 5 }; };
  const lnOf = k => text => ({ who: CREWDEF[k].name, role: CREWDEF[k].role, text });
  // ================= lines (every box 20 words or less) =================
  const DMG = { sport: 'Sporting Goods. Tents flat, kayaks down, balls in every corner. Mm. Crew, roll out.', tees: 'Funny T-Shirts. Mannequins on the floor, ink up the walls. Mm. Crew, roll out.',
    gelato: "Gelato. Freezers burst, the floor is a sticky pink lake. Smells nice. Mm. Crew, roll out.", elec: 'Electronics. Every screen cracked, wires spitting sparks. Dot will love it. Crew, roll out.',
    furn: 'Furniture. Chandeliers down, wardrobes leaning, a mattress fort. Mm. Crew, roll out.' };
  const DZ = { first: 'Mm. Dozer. Meru Hardware, and I fix things. You chased the bandits out. They left a big mess.', hi: ['Morning. Mm. Which store today?', 'Hm-hm-hmm. Oh. Hello, friend. Pick a store.', 'Tools packed. Crew fed. Mm. Which one?'],
    bad: 'Bullet holes, burst pipes, broken glass. Five shops of it. Mm. Worst I have seen. We fix it.', crew: 'Hank does wood. Volta does wires. Gus does water. Morty does cement. I hum.',
    today: "Crew's done for today. Mm. One store a day. Sleep, then come back.", bye: 'Mm. Mind the glass.',
    all1: 'All five. Mm. The Outlets look like the Outlets again. You did half of it.', all2: 'Take my HARD HAT and my old TOOL BELT. Mm. You are crew now.',
    open1: 'Mm. All five open. Shoppers everywhere. I hummed the whole way over.', open2: 'Take this GOLDEN OUTLET KEY. Opens nothing. Means everything. Mm. Hang it at home.',
    after: ['Mm. Look at them. Shiny. The shops open soon.', 'Hm-hm-hmmm. Oh. Hello, crew mate.', 'Coffee? Mm. It is mostly sawdust. Still good.'] };
  const HI = { master: ['Kid. Measure twice, nail once. The bandits measured nothing.', 'Cheap pine boards. We put our oak back. Ready?', 'Hammer in, sawdust out. Ready, kid?'],
    dot: ['Bright spark! Wires are my favourite spaghetti. Ready?', 'Red to red, blue to blue. Easy. Ready, bright spark?', 'Bandits shot the fuse box. Rude. Let us fix it.'],
    spritz: ['Leaks everywhere. Calm. Grab a wrench.', 'Wrong pipe, wrong way, wet fox. Ask me how I know.', 'Water wants to escape. We say no. Ready?'],
    brick: ['Cement waits for no fox. Neither do I.', 'Morty. Mortar. Yes, I have heard the joke.', "Magpie's boys cracked this with a car. We pour fresh."] };
  const WORD = { master: ['Forty years of lumber. I can tell oak from pine with my eyes shut.', 'Dozer hums the same three notes all day. I have learned to love them.', 'You have good hands, kid. Come cut some boards with me.'],
    dot: ['I once lit the whole store with one battery. Dozer said mm. High praise.', 'Tilly calls me a walking spark. I take it as a compliment.', 'You are a bright one. Brighter than a sixty watt. Seventy, easy.'],
    spritz: ['My grandad fixed Meru Castle’s pipes. Still no leaks. Family pride.', 'Fern takes my drips for her plants. Nothing wasted. I like that.', 'You stay calm with a wrench. Rare. Good.'],
    brick: ['Bricks are simple. Stack, mortar, stack. Life should be like that.', 'Fern thinks I hate plants. I water the ivy at night. Do not tell her.', 'You trowel straight. I respect a straight trowel.'] };
  const BYE = { master: 'Mind the nails, kid.', dot: 'Stay bright!', spritz: 'Stay dry.', brick: 'Back to work. Well, you. Go.' };
  const BARK = { dozer: ['Mm-hm-hmm... hm-hmm...', 'Hm. Hm-hm. Good day for fixing.', 'Mm-hmmm... hm... hmmm.'], master: ['Splinters everywhere. Bandits never sand.', 'Hold that board, kid? Thank you.'],
    dot: ['Live wire! Do not lick it.', 'Spark, spark, fixed. Love it.'], spritz: ['Drip... drip... not for long.', 'Puddle. Mind your paws.'], brick: ['That crater was a car. Now it is my problem.', 'Fresh cement. Do not write your name.'] };
  const TOWN = { dotGas: ['DOT: Hey, partner! The Outlet lights still bright? Mine are.', 'DOT: There is my crew mate! Wave, private!'], brkLife_brick: ['BRICK: Crew mate! The Outlets still smooth? Good. Very good.', 'BRICK: Halt! Oh. It is you. Hello, crew.'],
    fireHose: ['SPRITZ: My favourite plumber! Not a drip at the Outlets since.', 'SPRITZ: Hi, crew! Slide the pole later?'], woodMaster: ["MASTER CARPENTER: Mm. That is Dozer's word. Good to see you, crew.", 'MASTER CARPENTER: Our shop fronts still stand straight. Good nails.'] };
  TOWN.brkLife_brickS = TOWN.brkLife_brick; for (const k in TOWN) delete TOWN[k];   // s161: the crew are new foxes now; the old helpers' town greetings are off
  const INTRO = { carp: 'New boards. Tap when the yellow ring hugs the nail head. Eight nails, straight and true.', elec: 'Tap a wire, then the socket with its colour. Three boxes. The wrong one bites.',
    plumb: 'Tap pipes to turn them. Join the water left to right before the bucket spills.', cement: 'Hold POUR to the line, then let go. Smooth it flat before it sets.',
    sweep: 'Mm. Drag the broom. Push the mess into the pan. Mind the corners.', sign: 'Tap DROP over the hooks. Then tap BOLT when the bubble is in the middle. Mm.' };
  const DONE = { carp: 'Every nail flush. The bandit boards are firewood now.', elec: 'Lights on! Nobody got zapped. Well. Barely.', plumb: 'Dry as a desert. I almost miss the leak. Almost.',
    cement: 'Smooth as a pond. Do not write your name in it.', sweep: 'Mm. Clean. You could eat gelato off it. Do not.', sign: 'Straight. Mm. That is a sign. Of good things.' };
  // ================= sound, toast, card, panel =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.4) => { toastTxt = t; toastT = s; };
  let ac = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const thunk = () => { tone(140, 0.09, 0.12, 'square'); tone(90, 0.07, 0.2, 'triangle', 0.02); }, zap = () => { tone(1800, 0.04, 0.1, 'sawtooth'); tone(300, 0.05, 0.2, 'sawtooth', 0.05); }, hum = () => { tone(196, 0.03, 0.5); tone(247, 0.03, 0.5, 'sine', 0.45); tone(220, 0.03, 0.6, 'sine', 0.9); };
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; }, hideCard = () => { if (cardKey) { card.style.display = 'none'; cardKey = ''; } };
  const chips = items => '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>';
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL);
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = short ? Math.max(8, Math.min(180, (W - 320) / 2)) : 8, w = Math.min(640, W - side * 2); Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none') fitPanel(); });
  const BTN = 'flex:1;min-width:0;min-height:60px;padding:6px 12px;text-align:left;background:#ec3013;color:#fff;border:2px solid #201e1d;border-radius:0;font:900 22px Archivo,sans-serif;line-height:1.1;cursor:pointer;touch-action:none';
  const pulse = el => { if (!el) return; try { el.animate([{ outline: '4px solid #ffd23a' }, { outline: '8px solid rgba(255,210,58,0)' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  // ================= job engine =================
  let busy = null, J = null, lastP = null, lastFox = null, introT = 0;
  const setTip = (msg, bad) => { const t = PANEL.querySelector('[data-tip]'); if (t) { t.textContent = msg; t.style.background = bad ? RED : INK; t.style.color = bad ? '#ffffff' : YEL; } };
  const missOne = msg => { if (!J) return; J.miss++; nope(); setTip(msg, true); toast(msg, 1.6); };
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  function openPanel(title, tip, btns) { fitPanel(); const s = curStore();
    PANEL.innerHTML = '<div style="display:flex;align-items:center;gap:10px;background:#ec3013;color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2">' + title + '</span><span data-n style="white-space:nowrap">' + (s ? s.name : '') + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>'
      + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:8px;box-sizing:border-box"><canvas data-cv style="flex:1 1 0;min-height:0;width:100%;display:block;touch-action:none;background:#2a2826"></canvas>'
      + (btns ? '<div style="display:flex;gap:8px;flex:none">' + btns.map(b => '<button data-' + b[0] + ' style="' + BTN + '">' + b[1] + '</button>').join('') + '</div>' : '') + '</div>'
      + '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:14px;padding:9px 12px;line-height:1.25">' + tip + '</div>';
    PANEL.style.display = 'flex'; PANEL.querySelector('[data-stop]').onclick = () => quit(); J.cv = PANEL.querySelector('[data-cv]'); }
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  const ptOf = e => { const r = J.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  function bindCv(down, move, up) { const cv = J.cv; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; J.down = true; down && down(ptOf(e)); }; cv.onpointermove = e => { if (move) move(ptOf(e), J.down); }; cv.onpointerup = cv.onpointercancel = e => { const was = J.down; J.down = false; if (up && was) up(ptOf(e)); }; }
  function bindBtn(name, down, up) { const b = PANEL.querySelector('[data-' + name + ']'); if (!b) return; b.onpointerdown = e => { e.preventDefault(); J.idle = 0; down && down(); }; b.onpointerup = b.onpointercancel = b.onpointerleave = () => { up && up(); }; }
  function keyAct(down, up) { const kd = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) { J.idle = 0; down(); } } }, ku = e => { if ((e.code === 'Space' || e.code === 'Enter') && up) { e.preventDefault(); up(); } };
    addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; }
  const done1 = () => { if (!J || J.over) return; J.over = true; setTimeout(finishJob, 750); };
  const wood = (g, w, h, base = '#c9a27a') => { g.fillStyle = base; g.fillRect(0, 0, w, h); const n = Math.max(3, Math.round(w / 90)); for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? 'rgba(122,82,54,.18)' : 'rgba(255,255,255,.06)'; g.fillRect(i * w / n, 0, w / n, h); g.fillStyle = 'rgba(61,42,28,.5)'; g.fillRect(i * w / n, 0, 2, h); }
    g.strokeStyle = 'rgba(122,82,54,.35)'; g.lineWidth = 1.5; for (let k = 0; k < 8; k++) { const y = h * (0.08 + k * 0.12); g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + k) * 2.5); g.stroke(); } };
  const bigText = (g, t, x, y, size, col = '#fff') => { g.fillStyle = col; g.font = '900 ' + size + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(t, x, y); };
  const GD = {};
  // ---------- 1 CARPENTER: nail the new boards (tap when the shrinking ring hugs the nail head) ----------
  GD.carp = { btns: [['go', 'HAMMER']], tip: 'NAIL 1 / 8 \u00b7 TAP WHEN THE RING HUGS THE HEAD',
    begin() { J.n = 0; J.N = 8; J.nails = []; J.wait = 0.6; this.nail(); const hit = () => this.act(); bindCv(hit); bindBtn('go', hit); keyAct(hit); },
    nail() { J.nl = { x: rnd(0.14, 0.86), y: rnd(0.22, 0.8) }; J.r = 1; J.sp = 1 / Math.max(1.0, 1.7 - J.n * 0.08); },
    act() { if (J.over || J.wait > 0) return; if (J.r > 0.08 && J.r < 0.36) { thunk(); J.nails.push(J.nl); J.n++; J.wait = 0.35; if (J.n >= J.N) { setTip('EVERY NAIL FLUSH!'); done1(); return; } setTip('NAIL ' + (J.n + 1) + ' / 8 \u00b7 ' + (J.n < 4 ? 'BOARD' : 'SHELF')); this.nail(); }
      else { missOne(J.r >= 0.36 ? 'TOO EARLY \u00b7 BENT IT' : 'TOO LATE \u00b7 BENT IT'); J.r = 1; J.wait = 0.3; } },
    tick(dt) { if (J.over) return; if (J.wait > 0) { J.wait -= dt; return; } J.r -= dt * J.sp; if (J.r <= 0.06) { missOne('TOO SLOW \u00b7 THE RING CLOSED'); J.r = 1; J.wait = 0.3; } },
    draw(g, w, h) { wood(g, w, h); const R = Math.min(w, h) * 0.3; if (J.n >= 4) { g.fillStyle = '#7a5236'; g.fillRect(w * 0.1, h * 0.5, w * 0.8, h * 0.08); }
      for (const n of J.nails) { g.fillStyle = '#3a3836'; g.beginPath(); g.arc(n.x * w, n.y * h, R * 0.14, 0, 7); g.fill(); g.fillStyle = '#9aa0a6'; g.beginPath(); g.arc(n.x * w - 2, n.y * h - 2, R * 0.06, 0, 7); g.fill(); }
      if (!J.over) { const x = J.nl.x * w, y = J.nl.y * h, good = J.r > 0.08 && J.r < 0.36; g.fillStyle = '#9aa0a6'; g.beginPath(); g.arc(x, y, R * 0.2, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
        g.strokeStyle = good ? '#7cff9b' : YEL; g.lineWidth = 8; g.beginPath(); g.arc(x, y, Math.max(2, R * J.r), 0, 7); g.stroke(); }
      bigText(g, J.n + ' / 8', 12, 22, 22, INK); } };
  // ---------- 2 ELECTRICIAN: tap a wire, then its colour's socket (3 boxes: 3, 4, 5 wires) ----------
  const WIRES = [['R', '#ec3013', 'RED'], ['B', '#2e86b8', 'BLUE'], ['Y', '#ffd23a', 'YELLOW'], ['G', '#2f9a5e', 'GREEN'], ['W', '#f3f2f2', 'WHITE']];
  GD.elec = { btns: null, tip: 'BOX 1 / 3 \u00b7 TAP A WIRE, THEN ITS SOCKET',
    begin() { J.box = 0; this.setup(); bindCv(p => this.down(p), (p, d) => { J.ptr = d ? p : null; }, p => this.up(p)); },
    setup() { const n = [3, 4, 5][J.box]; J.L = shuffle(WIRES.slice(0, n)); J.Rr = shuffle(J.L.slice()); J.link = {}; J.sel = null; J.flash = 0; },
    row(p) { const n = J.L.length; return clamp(Math.round(p.y / p.h * (n + 1)) - 1, 0, n - 1); },
    down(p) { if (J.over) return; const i = this.row(p); if (p.x < p.w * 0.45) { if (J.link[i] == null) { J.sel = i; blip(); } } else if (J.sel != null) this.tryLink(i); J.ptr = p; },
    up(p) { if (J.over || J.sel == null) return; if (p.x > p.w * 0.55) this.tryLink(this.row(p)); J.ptr = null; },
    tryLink(ri) { const used = Object.values(J.link).includes(ri); if (used) return; if (J.Rr[ri][0] === J.L[J.sel][0]) { J.link[J.sel] = ri; J.sel = null; ding();
        if (Object.keys(J.link).length >= J.L.length) { J.box++; if (J.box >= 3) { setTip('ALL THREE BOXES LIVE!'); done1(); } else { setTip('BOX ' + (J.box + 1) + ' / 3 \u00b7 TAP A WIRE, THEN ITS SOCKET'); setTimeout(() => { if (J && J.g === 'elec') this.setup(); }, 600); } } }
      else { zap(); J.flash = 0.35; J.flashR = ri; missOne('ZAP! THAT IS ' + J.Rr[ri][2] + ', NOT ' + J.L[J.sel][2]); J.sel = null; } },
    tick(dt) { J.flash = Math.max(0, J.flash - dt); },
    draw(g, w, h) { g.fillStyle = '#3a3f45'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2e33'; g.fillRect(w * 0.06, h * 0.04, w * 0.88, h * 0.92); const n = J.L.length, lx = w * 0.2, rx = w * 0.8, rr = Math.min(26, h / (n + 1) * 0.36);
      const y = i => h * (i + 1) / (n + 1);
      for (const li in J.link) { const a = +li, b = J.link[li], c = J.L[a][1]; g.strokeStyle = c; g.lineWidth = 9; g.beginPath(); g.moveTo(lx, y(a)); g.bezierCurveTo(w * 0.5, y(a), w * 0.5, y(b), rx, y(b)); g.stroke(); }
      if (J.sel != null && J.ptr) { g.strokeStyle = J.L[J.sel][1]; g.lineWidth = 9; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(lx, y(J.sel)); g.lineTo(J.ptr.x, J.ptr.y); g.stroke(); g.setLineDash([]); }
      for (let i = 0; i < n; i++) { const [l, c] = J.L[i]; g.strokeStyle = c; g.lineWidth = 9; g.beginPath(); g.moveTo(0, y(i)); g.lineTo(lx, y(i)); g.stroke(); g.fillStyle = c; g.beginPath(); g.arc(lx, y(i), rr, 0, 7); g.fill(); g.lineWidth = J.sel === i ? 6 : 3; g.strokeStyle = J.sel === i ? YEL : INK; g.stroke();
        g.fillStyle = l === 'W' || l === 'Y' ? INK : '#fff'; g.font = '900 ' + Math.round(rr) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(l, lx, y(i) + 1);
        const [l2, c2] = J.Rr[i]; g.fillStyle = INK; g.fillRect(rx - rr, y(i) - rr, rr * 2, rr * 2); g.strokeStyle = c2; g.lineWidth = 6; g.strokeRect(rx - rr + 3, y(i) - rr + 3, rr * 2 - 6, rr * 2 - 6); if (J.flash > 0 && J.flashR === i) { g.fillStyle = YEL; g.fillRect(rx - rr, y(i) - rr, rr * 2, rr * 2); }
        g.fillStyle = c2; g.fillText(l2, rx, y(i) + 1); g.textAlign = 'left'; } } };
  // ---------- 3 PLUMBER: tap pipe tiles to turn them; join the water left to right before the bucket spills (3 puzzles, 4 x 4) ----------
  const OPEN = { I: [0, 2], L: [0, 1] }, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const ops = c => OPEN[c.t].map(d => (d + c.r) % 4);
  GD.plumb = { btns: null, tip: 'PIPES 1 / 3 \u00b7 TAP A PIPE TO TURN IT',
    begin() { J.p = 0; this.gen(); bindCv(p => this.tap(p)); },
    gen() { const N = 4; let path = null; for (let tries = 0; tries < 60 && !path; tries++) { const r0 = Math.floor(Math.random() * N), vis = new Set(), pth = [];
        const dfs = (x, y) => { vis.add(x + ',' + y); pth.push([x, y]); if (x === N - 1 && Math.random() < 0.55) return true; for (const d of shuffle([0, 1, 2, 3])) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= N || ny >= N || vis.has(nx + ',' + ny)) continue; if (dfs(nx, ny)) return true; } if (x === N - 1) return true; pth.pop(); return false; };
        if (dfs(0, r0) && pth.length >= 5) path = pth; }
      if (!path) { const r0 = Math.floor(Math.random() * N); path = [0, 1, 2, 3].map(x => [x, r0]); }
      const G = []; for (let y = 0; y < N; y++) { G.push([]); for (let x = 0; x < N; x++) G[y].push({ t: Math.random() < 0.5 ? 'I' : 'L', r: Math.floor(Math.random() * 4) }); }
      const dirTo = (a, b) => (b[0] > a[0] ? 1 : b[0] < a[0] ? 3 : b[1] > a[1] ? 2 : 0);
      path.forEach((c, i) => { const din = i === 0 ? 3 : dirTo(c, path[i - 1]), dout = i === path.length - 1 ? 1 : dirTo(c, path[i + 1]), t = (din + 2) % 4 === dout ? 'I' : 'L'; let r = 0;
        for (; r < 4; r++) { const o = ops({ t, r }); if (o.includes(din) && o.includes(dout)) break; } G[c[1]][c[0]] = { t, r: (r + 1 + Math.floor(Math.random() * 3)) % 4 }; });
      J.G = G; J.N = N; J.in = path[0][1]; J.out = path[path.length - 1][1]; J.bk = 0; J.solved = false; this.flow(); if (J.solved) { const c = path[1]; G[c[1]][c[0]].r = (G[c[1]][c[0]].r + 1) % 4; this.flow(); } },
    flow() { const N = J.N; J.wet = new Set(); let x = 0, y = J.in, side = 3; J.solved = false;
      for (let k = 0; k < 20; k++) { const c = J.G[y][x], o = ops(c); if (!o.includes(side)) break; J.wet.add(x + ',' + y); const d = o.find(q => q !== side); if (x === N - 1 && d === 1) { J.solved = y === J.out; break; } x += DX[d]; y += DY[d]; if (x < 0 || y < 0 || x >= N || y >= N) break; side = (d + 2) % 4; } },
    geom(w, h) { const S = Math.min(w * 0.8, h * 0.8), cs = S / J.N; return { S, cs, ox: (w - S) / 2, oy: (h - S) / 2 + h * 0.04 }; },
    tap(p) { if (J.over || J.solved) return; const { cs, ox, oy } = this.geom(p.w, p.h), x = Math.floor((p.x - ox) / cs), y = Math.floor((p.y - oy) / cs); if (x < 0 || y < 0 || x >= J.N || y >= J.N) return;
      J.G[y][x].r = (J.G[y][x].r + 1) % 4; blip(); this.flow(); if (J.solved) { ding(); J.p++; if (J.p >= 3) { setTip('NOT A DRIP!'); done1(); } else { setTip('PIPES ' + (J.p + 1) + ' / 3 \u00b7 TAP A PIPE TO TURN IT'); setTimeout(() => { if (J && J.g === 'plumb') this.gen(); }, 900); } } },
    tick(dt) { if (J.over || J.solved) return; J.bk += dt / [18, 16, 14][J.p]; if (J.bk >= 1) { missOne('BUCKET SPILLED! SPRITZ EMPTIES IT'); J.bk = 0; } },
    draw(g, w, h) { g.fillStyle = '#5a5654'; g.fillRect(0, 0, w, h); const { cs, ox, oy, S } = this.geom(w, h);
      g.fillStyle = INK; g.fillRect(8, 8, w - 16, h * 0.05); g.fillStyle = J.bk > 0.75 ? RED : '#5b8fb0'; g.fillRect(8, 8, (w - 16) * J.bk, h * 0.05); bigText(g, 'BUCKET', 14, 8 + h * 0.025, Math.max(11, h * 0.035), '#fff');
      const wet = c => J.wet.has(c);
      g.fillStyle = '#5b8fb0'; g.fillRect(0, oy + (J.in + 0.38) * cs, ox, cs * 0.24); g.fillStyle = J.solved ? '#5b8fb0' : '#3a3836'; g.fillRect(ox + S, oy + (J.out + 0.38) * cs, ox, cs * 0.24);
      for (let y = 0; y < J.N; y++) for (let x = 0; x < J.N; x++) { const c = J.G[y][x], cx = ox + (x + 0.5) * cs, cy = oy + (y + 0.5) * cs; g.fillStyle = (x + y) % 2 ? '#e7e4dc' : '#dcd8cf'; g.fillRect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2);
        const isW = wet(x + ',' + y); g.strokeStyle = isW ? '#2e86b8' : '#6f747a'; g.lineWidth = cs * 0.24; g.lineCap = 'butt'; for (const d of ops(c)) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + DX[d] * cs / 2, cy + DY[d] * cs / 2); g.stroke(); }
        g.fillStyle = isW ? '#2e86b8' : '#6f747a'; g.beginPath(); g.arc(cx, cy, cs * 0.12, 0, 7); g.fill(); }
      g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(ox, oy, S, S); } };
  // ---------- 4 CEMENT: hold POUR to the line, let go; then drag to smooth the lumps before it sets (2 slabs) ----------
  GD.cement = { btns: [['go', 'HOLD TO POUR']], tip: 'SLAB 1 / 2 \u00b7 HOLD POUR, LET GO ON THE LINE',
    begin() { J.slab = 0; this.reset(); const dn = () => { if (J.ph === 'pour' && !J.over) J.hold = true; }, up = () => { if (J.hold) { J.hold = false; this.release(); } };
      bindBtn('go', dn, up); keyAct(dn, up); bindCv(p => { if (J.ph === 'pour') dn(); else this.trowel(p); }, (p, d) => { if (d && J.ph === 'smooth') this.trowel(p); J.ptr = d ? p : null; }, () => { if (J.ph === 'pour') up(); }); },
    reset() { J.ph = 'pour'; J.lvl = 0; J.hold = false; const b = PANEL.querySelector('[data-go]'); if (b) { b.textContent = 'HOLD TO POUR'; b.style.opacity = '1'; } },
    release() { if (J.lvl > 0.84) { missOne('SPILLED OVER THE FORM'); J.lvl = 0.8; this.smooth(); } else if (J.lvl >= 0.68) { ding(); this.smooth(); } else if (J.lvl > 0.03) { missOne('TOO THIN \u00b7 POUR SOME MORE'); } },
    smooth() { J.ph = 'smooth'; J.cells = []; for (let i = 0; i < 40; i++) J.cells.push(Math.random() < 0.6 ? rnd(0.5, 1) : 0); J.h0 = J.cells.reduce((a, b) => a + b, 0); J.set = 0; setTip('SMOOTH IT \u00b7 DRAG OVER THE LUMPS BEFORE IT SETS'); const b = PANEL.querySelector('[data-go]'); if (b) { b.textContent = 'DRAG ON THE CEMENT'; b.style.opacity = '0.5'; } },
    trowel(p) { const gx = (p.x / p.w - 0.08) / 0.84 * 8, gy = (p.y / p.h - 0.16) / 0.76 * 5; for (let i = 0; i < 40; i++) { const cx = i % 8 + 0.5, cy = Math.floor(i / 8) + 0.5; if (Math.hypot(cx - gx, cy - gy) < 0.95 && J.cells[i] > 0) J.cells[i] = Math.max(0, J.cells[i] - 0.09); } },
    tick(dt) { if (J.over) return; if (J.ph === 'pour') { if (J.hold) { J.lvl += dt * 0.3; if (J.lvl >= 1) { J.hold = false; this.release(); } } return; }
      J.set += dt / 13; const left = J.cells.reduce((a, b) => a + b, 0) / (J.h0 || 1); if (left < 0.1 || J.set >= 1) { if (J.set >= 1 && left >= 0.1) { J.miss += left > 0.4 ? 2 : 1; nope(); setTip('IT SET WITH LUMPS', true); } else ding();
        J.slab++; if (J.slab >= 2) { done1(); J.ph = 'end'; return; } setTip('SLAB 2 / 2 \u00b7 HOLD POUR, LET GO ON THE LINE'); this.reset(); } },
    draw(g, w, h) { g.fillStyle = '#7a7470'; g.fillRect(0, 0, w, h);
      if (J.ph === 'pour') { const x0 = w * 0.2, x1 = w * 0.8, y0 = h * 0.1, y1 = h * 0.92; g.fillStyle = WOOD; g.fillRect(x0 - 12, y0, 12, y1 - y0); g.fillRect(x1, y0, 12, y1 - y0); g.fillRect(x0 - 12, y1, x1 - x0 + 24, 12);
        const lh = (y1 - y0) * J.lvl; g.fillStyle = J.lvl > 0.84 ? '#b0623f' : '#b9b4ac'; g.fillRect(x0, y1 - lh, x1 - x0, lh); const bt = y1 - (y1 - y0) * 0.84, bb = y1 - (y1 - y0) * 0.68;
        g.fillStyle = 'rgba(124,255,155,.35)'; g.fillRect(x0, bt, x1 - x0, bb - bt); g.strokeStyle = '#7cff9b'; g.lineWidth = 4; g.strokeRect(x0, bt, x1 - x0, bb - bt); bigText(g, 'LINE', x1 + 18, (bt + bb) / 2, 18, '#fff');
        if (J.hold) { g.fillStyle = '#b9b4ac'; g.fillRect(w * 0.48, 0, w * 0.04, y1 - lh); } return; }
      const x0 = w * 0.08, y0 = h * 0.16, cw = w * 0.84 / 8, ch = h * 0.76 / 5; g.fillStyle = WOOD; g.fillRect(x0 - 8, y0 - 8, w * 0.84 + 16, h * 0.76 + 16); g.fillStyle = '#b9b4ac'; g.fillRect(x0, y0, w * 0.84, h * 0.76);
      for (let i = 0; i < 40; i++) { const v = J.cells[i]; if (v <= 0.02) continue; const cx = x0 + (i % 8 + 0.5) * cw, cy = y0 + (Math.floor(i / 8) + 0.5) * ch; g.fillStyle = '#8f8a83'; g.beginPath(); g.ellipse(cx, cy, cw * 0.42 * v + 3, ch * 0.4 * v + 3, 0, 0, 7); g.fill(); g.fillStyle = '#d6d2cb'; g.beginPath(); g.ellipse(cx - cw * 0.1, cy - ch * 0.1, cw * 0.16 * v, ch * 0.14 * v, 0, 0, 7); g.fill(); }
      g.fillStyle = INK; g.fillRect(8, 8, w - 16, h * 0.05); g.fillStyle = J.set > 0.75 ? RED : YEL; g.fillRect(8, 8, (w - 16) * (1 - J.set), h * 0.05); bigText(g, 'SETTING', 14, 8 + h * 0.025, Math.max(11, h * 0.035), J.set > 0.75 ? '#fff' : INK);
      if (J.ptr) { g.fillStyle = STEEL; g.save(); g.translate(J.ptr.x, J.ptr.y); g.rotate(-0.3); g.fillRect(-cw * 0.9, -ch * 0.3, cw * 1.8, ch * 0.6); g.fillStyle = WOOD; g.fillRect(-6, -ch * 0.9, 12, ch * 0.6); g.restore(); } } };
  // ---------- 5 SWEEP: drag the broom, push the mess into the pan (40 s) ----------
  GD.sweep = { btns: null, tip: 'DRAG THE BROOM \u00b7 PUSH THE MESS INTO THE PAN',
    begin() { J.ps = []; for (let i = 0; i < 14; i++) J.ps.push({ x: rnd(0.08, 0.92), y: rnd(0.12, 0.7), k: i % 4, a: rnd(0, 6) }); J.ps.push({ x: rnd(0.2, 0.8), y: rnd(0.2, 0.6), k: 'coin', a: 0 }); J.t = 0; J.got = 0; J.coin = false;
      bindCv(p => { J.bp = p; }, (p, d) => { if (d && J.bp) this.push(J.bp, p); J.bp = d ? p : null; }, () => { J.bp = null; }); },
    push(a, b) { const dx = (b.x - a.x) / b.w, dy = (b.y - a.y) / b.h, R = Math.min(b.w, b.h) * 0.13; for (const p of J.ps) { if (p.in) continue; if (Math.hypot(p.x * b.w - b.x, p.y * b.h - b.y) < R) { p.x = clamp(p.x + dx * 1.15, 0.03, 0.97); p.y = clamp(p.y + dy * 1.15, 0.05, 0.99); } } },
    tick(dt) { if (J.over) return; J.t += dt; for (const p of J.ps) { if (p.in) continue; if (p.y > 0.86 && p.x > 0.36 && p.x < 0.64) { p.in = true; if (p.k === 'coin') { J.coin = true; coin(); J.gold += 5; save.addGold(5); setTip('A COIN! +5 GOLD'); } else { J.got++; blip(); } } }
      const n = J.ps.filter(p => p.k !== 'coin').length, left = n - J.got; if (left <= 0) { setTip('SPOTLESS!'); done1(); return; } if (J.t >= 40) { J.miss += Math.ceil(left / 2); nope(); setTip('TIME! ' + left + ' BITS LEFT', true); done1(); } },
    draw(g, w, h) { const s = curStore(), th = THEME[s ? s.key : 'sport']; for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) { g.fillStyle = (x + y) % 2 ? '#d8d4cc' : '#c9c4ba'; g.fillRect(x * w / 6, y * h / 6, w / 6 + 1, h / 6 + 1); }
      g.fillStyle = INK; g.fillRect(w * 0.36, h * 0.86, w * 0.28, h * 0.14); bigText(g, 'PAN', w * 0.38, h * 0.93, Math.max(14, h * 0.05), YEL);
      const r = Math.min(w, h) * 0.035; for (const p of J.ps) { if (p.in) continue; const x = p.x * w, y = p.y * h; g.save(); g.translate(x, y); g.rotate(p.a);
        if (p.k === 'coin') { g.fillStyle = YEL; g.beginPath(); g.arc(0, 0, r * 1.1, 0, 7); g.fill(); g.strokeStyle = '#a8801a'; g.lineWidth = 3; g.stroke(); }
        else if (p.k === 0) { g.fillStyle = '#6f6b66'; g.fillRect(-r, -r * 0.7, r * 2, r * 1.4); } else if (p.k === 1) { g.fillStyle = WOOD; g.fillRect(-r * 1.8, -r * 0.3, r * 3.6, r * 0.6); }
        else { g.fillStyle = th[p.k % th.length]; g.beginPath(); if (s && s.key === 'elec') { g.moveTo(-r, r); g.lineTo(0, -r * 1.2); g.lineTo(r, r); } else g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); } g.restore(); }
      if (J.bp) { g.fillStyle = '#c9a27a'; g.fillRect(J.bp.x - Math.min(w, h) * 0.13, J.bp.y - 8, Math.min(w, h) * 0.26, 16); g.fillStyle = '#7a5236'; g.fillRect(J.bp.x - 4, J.bp.y - Math.min(w, h) * 0.3, 8, Math.min(w, h) * 0.3); }
      g.fillStyle = INK; g.fillRect(8, 8, w - 16, h * 0.05); g.fillStyle = J.t > 30 ? RED : YEL; g.fillRect(8, 8, (w - 16) * (1 - J.t / 40), h * 0.05); } };
  // ---------- 6 HANG THE SIGN: tap DROP over the hooks, then BOLT twice when the bubble is level ----------
  GD.sign = { btns: [['go', 'DROP']], tip: 'TAP DROP WHEN THE SIGN IS OVER THE HOOKS',
    begin() { J.ph = 'drop'; J.t = 0; J.b = 0; J.wait = 0.5; const a = () => this.act(); bindBtn('go', a); bindCv(a); keyAct(a); },
    off() { return Math.sin(J.t * 1.6) * 0.3; }, ang() { return Math.sin(J.t * 2.0) * 0.24; },
    act() { if (J.over || J.wait > 0) return; if (J.ph === 'drop') { if (Math.abs(this.off()) < 0.05) { thunk(); J.ph = 'bolt'; J.t = 0.6; J.wait = 0.3; setTip('BOLT 1 / 2 \u00b7 TAP BOLT WHEN THE BUBBLE IS IN THE MIDDLE'); const b = PANEL.querySelector('[data-go]'); if (b) b.textContent = 'BOLT'; } else { missOne('MISSED THE HOOKS \u00b7 IT SWINGS BACK'); J.wait = 0.4; } return; }
      if (Math.abs(this.ang()) < 0.045) { thunk(); J.b++; J.wait = 0.3; if (J.b >= 2) { J.fin = this.ang(); setTip('LEVEL! SIGN UP!'); done1(); } else setTip('BOLT 2 / 2 \u00b7 ONE MORE'); } else { missOne('NOT LEVEL \u00b7 WAIT FOR THE MIDDLE'); J.wait = 0.4; } },
    tick(dt) { if (J.over) return; if (J.wait > 0) J.wait -= dt; J.t += dt * (J.ph === 'bolt' ? 1 + J.b * 0.25 : 1); },
    draw(g, w, h) { const s = curStore() || STORES[0]; g.fillStyle = s.wall; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.fillRect(0, h * 0.86, w, h * 0.14);
      const sw = w * 0.62, sh = Math.min(h * 0.2, sw / 5), hx = w / 2, hy = h * 0.42; g.fillStyle = '#3a3836'; for (const sx of [-1, 1]) g.fillRect(hx + sx * sw * 0.35 - 6, hy - sh / 2 - 22, 12, 22);
      let cx = hx, cy = hy, a = 0; if (J.ph === 'drop' && !J.over) { cx = hx + this.off() * w; cy = hy - h * 0.16; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, cy - sh / 2); g.stroke(); } else a = J.over ? J.fin || 0 : this.ang();
      g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = s.bg; g.fillRect(-sw / 2, -sh / 2, sw, sh); g.fillStyle = s.bar; g.fillRect(-sw / 2, -sh / 2, 10, sh); g.fillStyle = s.fg; fitTxt(g, s.name, sw * 0.86, Math.round(sh * 0.55)); g.textBaseline = 'middle'; g.fillText(s.name, -sw / 2 + 22, 2);
      if (J.ph === 'bolt') for (let i = 0; i < 2; i++) { g.fillStyle = i < J.b ? YEL : '#555'; g.beginPath(); g.arc((i ? 1 : -1) * sw * 0.42, 0, 8, 0, 7); g.fill(); } g.restore();
      if (J.ph === 'bolt') { const lw = w * 0.5, lx = w * 0.25, ly = h * 0.72, lh = Math.max(30, h * 0.08); g.fillStyle = '#e7e4dc'; g.fillRect(lx, ly, lw, lh); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(lx, ly, lw, lh);
        g.fillStyle = 'rgba(124,255,155,.6)'; g.fillRect(w / 2 - lw * 0.09, ly + 2, lw * 0.18, lh - 4); const bx = w / 2 + (J.over ? 0 : this.ang() / 0.24) * lw * 0.42; g.fillStyle = '#9fd36a'; g.beginPath(); g.arc(bx, ly + lh / 2, lh * 0.36, 0, 7); g.fill(); g.strokeStyle = INK; g.stroke(); } } };
  // ---- run a job ----
  const stars = () => (J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1);
  function startJob(g) { if (busy) return; const s = curStore(); if (!s) return; const who = JK[g].who; busy = 'intro'; introT = 0; makeCrew(); sayTo(crewT(who), [lnOf(who)(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; const D = GD[g]; J = { g, miss: 0, gold: 0, idle: 0, hinted: false, over: false }; busy = 'job'; ding(); openPanel(JK[g].name + ' \u00b7 ' + CREWDEF[JK[g].who].name.toUpperCase(), D.tip, D.btns); D.begin(); }
  function finishJob() { if (!J || busy !== 'job') return; const g = J.g, st = stars(), r = R(), s = curStore(); J.off && J.off(); hidePanel();
    const first = !(r.jobs && r.jobs[g]), gold = first ? 10 + st * 5 : 5; save.addGold(gold); coin(); try { save.addXp && save.addXp(first ? 15 : 4); } catch (e) {}
    r.jobs = { ...(r.jobs || {}), [g]: true }; r.best = { ...(r.best || {}) }; r.best[g] = Math.max(r.best[g] || 0, st); const who = JK[g].who; if (who !== 'dozer') r.friend = { ...(r.friend || {}), [who]: ((r.friend || {})[who] || 0) + 1 };
    const all6 = JOBS.every(j => r.jobs[j.k]); setR(r); syncAll(true); busy = 'end'; const tot = J.gold + gold; J = null; toast(JK[g].name + ' \u00b7 ' + '\u2605'.repeat(st) + '\u2606'.repeat(3 - st) + ' \u00b7 +' + tot + ' GOLD', 3);
    sayTo(crewT(who), [lnOf(who)(DONE[g] + (st === 3 ? ' Three stars.' : ''))], () => { busy = null; if (all6 && s) storeFixed(s); });
    setTimeout(() => { if (busy === 'end') busy = null; }, 30000); }
  function quit() { if (busy === 'intro') { busy = null; return; } if (busy !== 'job') return; J && J.off && J.off(); hidePanel(); J = null; busy = null; toast('JOB STOPPED \u00b7 COME BACK ANY TIME', 2); }
  // ---- a store finished · all five finished ----
  const HAT = { outfit: 'vest', torso: ['#ff7a1a', '#ffd23a', '#7a3d1a'], name: 'HARD HAT CREW' };
  function storeFixed(s) { const r = R(); r.done = { ...r.done, [s.key]: true }; r.cur = null; r.jobs = {}; r.lastDay = day(); const allNow = STORES.every(q => r.done[q.key]); if (allNow) r.all = true; setR(r);
    save.addGold(40); try { save.addXp && save.addXp(40); } catch (e) {} ding(); syncAll(true); crewHome(); toast(s.name + ' IS FIXED \u00b7 OPENING SOON \u00b7 +40 GOLD', 3.4);
    const dz = lnOf('dozer'); if (!allNow) { sayTo(crewT('dozer'), [dz('Mm. ' + cap(s.name) + ' is fixed. Opening soon. One a day, friend. See you tomorrow.')]); return; }
    sayTo(crewT('dozer'), [dz(DZ.all1), dz(DZ.all2)], () => { try { const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === HAT.name)) save.setStat('tailorOutfits', [...list, HAT]); save.setOutfit(HAT); wear && wear(HAT); save.give('toolBelt'); save.addGold(100); save.addXp && save.addXp(150); save.setFlag && save.setFlag('outletsRepaired'); } catch (e) {}
      toast('HARD HAT CREW OUTFIT + TOOL BELT \u00b7 +100 GOLD', 4); }); }
  const cap = t => t.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
  // ---- Dozer's menu (YES, PUT ME TO WORK! first · GOODBYE last) ----
  let hiN = 0; const curStore = () => { const k = R().cur; return k ? SK[k] : null; };
  const nextFree = () => STORES.find(s => !R().done[s.key]);
  const nextJob = () => { const r = R(); return (JOBS.find(j => !(r.jobs || {})[j.k]) || JOBS[0]).k; };
  function pickStore(s) { const r = R(); if (r.cur || r.lastDay === day() || r.done[s.key]) return; r.cur = s.key; r.jobs = {}; r.sup = {}; r.supOK = false; setR(r); makeCrew(); syncAll(true); hum();
    sayTo(crewT('dozer'), [lnOf('dozer')(DMG[s.key].replace(' Crew, roll out.', '')), lnOf('dozer')('Supplies first. Every department has your list. I sign the tab last.')], () => toast('SUPPLY RUN \u00b7 STEP IN EACH YELLOW RING', 3)); }
  // s161 SUPPLY RUN (Meru Hardware): each department hands over its part of the list, Dozer signs the tab, the truck takes it + the crew to the store
  function supPick(k) { const r = R(); if (!r.cur || r.supOK) return; r.sup = { ...(r.sup || {}), [k]: true }; setR(r); }
  function supplied() { const r = R(); if (!r.cur || r.supOK) return; r.supOK = true; setR(r); syncAll(true); crewOut(SK[r.cur]); }
  function dozerMenu(extra = []) { makeCrew(); const r = R(), dz = lnOf('dozer'), T = crewT('dozer'), byeOnly = { text: CHOICE_BYE, bye: true, pick: () => sayTo(crewT('dozer'), [dz(DZ.bye)]) }, bye = [...extra, byeOnly];
    const crew0 = { text: "WHO'S ON THE CREW?", pick: () => sayTo(crewT('dozer'), [dz(DZ.crew)]) };
    if (!ready()) { sayTo(T, [{ ...dz(hiN++ % 2 ? 'Mm. Bandits hold the Outlets. Clear them out. Then my crew fixes the mess.' : 'Mm. Dozer. Meru Hardware. Seven departments. I mostly hum.'), choices: [{ text: CHOICE_WORK, pick: () => sayTo(crewT('dozer'), [dz('Mm. Nothing to fix yet. Magpie owns the Outlets. Chase him out first.')]) }, ...bye] }]); return; }
    if (r.cur && !r.supOK) { const left = ['lumber', 'elec', 'plumb', 'mason', 'paint', 'garden'].filter(k => !(r.sup || {})[k]).length;
      sayTo(T, [{ ...dz('Mm. ' + cap(SK[r.cur].name) + ' today. ' + (left ? left + ' departments to go. Then I sign the tab.' : 'List done. I sign the tab.')), choices: [{ text: CHOICE_WORK, pick: () => { if (!left && window.__hardware && window.__hardware.signTab) window.__hardware.signTab(); else sayTo(crewT('dozer'), [dz('Mm. Start with Hank. Lumber, back left. The yellow rings show the list.')]); } }, crew0, ...bye] }]); return; }
    const crew = { text: "WHO'S ON THE CREW?", pick: () => sayTo(crewT('dozer'), [dz(DZ.crew)]) }, bad = { text: 'HOW BAD IS IT?', pick: () => sayTo(crewT('dozer'), [dz(DZ.bad)]) };
    if (r.all && !save.flag('outletsGrandOpen') && window.__open && window.__open.allOpen && window.__open.allOpen()) { sayTo(T, [dz(DZ.open1), dz(DZ.open2)], () => { try { save.setFlag('outletsGrandOpen'); save.give('goldenOutletKey'); save.addGold(250); save.addXp && save.addXp(200); } catch (e) {} ding(); toast('GOLDEN OUTLET KEY \u00b7 +250 GOLD \u00b7 +200 XP', 4); }); return; }   // s159: the crew boss's big reward once all 5 stores are OPEN
    if (r.all) { sayTo(T, [{ ...dz(DZ.after[hiN++ % DZ.after.length]), choices: [{ text: CHOICE_WORK, pick: () => sayTo(crewT('dozer'), [dz('Mm. Nothing left to fix. Good problem. Come say hello.')]) }, { text: 'THE OUTLETS LOOK GREAT', pick: () => sayTo(crewT('dozer'), [dz('Mm. They do. Magpie would hate it. That is the best part.')]) }, { text: 'WHAT NEXT FOR YOU?', pick: () => sayTo(crewT('dozer'), [dz('Fix things. Sell hammers. Hum. Same as always.')]) }, ...extra, { text: CHOICE_BYE, bye: true, pick: () => sayTo(crewT('dozer'), [dz('Mm. Mind how you go.')]) }] }]); return; }
    const first = !r.met; if (first) { r.met = true; setR(r); }
    if (r.cur) { const s = SK[r.cur], left = JOBS.filter(j => !(r.jobs || {})[j.k]).length;
      sayTo(T, [{ ...dz('Mm. ' + cap(s.name) + ' today. Rings are out front. ' + left + (left === 1 ? ' job' : ' jobs') + ' to go.'), choices: [{ text: CHOICE_WORK, pick: () => startJob(nextJob()) }, { text: 'HOW BAD IS IT?', pick: () => sayTo(crewT('dozer'), [dz(DMG[s.key].replace(' Crew, roll out.', ''))]) }, crew, ...bye] }]); return; }
    if (r.lastDay === day()) { sayTo(T, [{ ...dz(DZ.today), choices: [{ text: CHOICE_WORK, pick: () => sayTo(crewT('dozer'), [dz('Mm. Tomorrow, friend. Even I sleep. Sometimes.')]) }, { text: "HOW'S IT GOING?", pick: () => sayTo(crewT('dozer'), [dz(nFixed() + ' of 5 fixed. Mm. Good pace. Good crew.')]) }, ...bye] }]); return; }
    const free = STORES.filter(s => !r.done[s.key]);
    sayTo(T, [{ ...dz(first ? DZ.first : DZ.hi[hiN++ % DZ.hi.length]), choices: [{ text: CHOICE_WORK, pick: () => { const s = nextFree(); if (s) pickStore(s); } },
      { text: 'PICK A STORE', pick: () => sayTo(crewT('dozer'), [{ ...dz('Which one? One a day. Mm.'), choices: [...free.map(s => ({ text: s.name, pick: () => pickStore(s) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) }, bad, crew, ...bye] }]); }
  function helperMenu(k) { const r = R(), ln = lnOf(k), j = JOBS.find(q => q.who === k), fr = (r.friend || {})[k] || 0, did = (r.jobs || {})[j.k];
    sayTo(crewT(k), [{ ...ln(HI[k][fr % HI[k].length]), choices: [{ text: CHOICE_WORK, pick: () => startJob(j.k) }, { text: (did ? '\u2713 ' : '') + j.name + ' \u00b7 HOW?', pick: () => sayTo(crewT(k), [ln(INTRO[j.k])]) },
      { text: 'A WORD?', pick: () => { const rr = R(), n = (rr.friend || {})[k] || 0; rr.friend = { ...(rr.friend || {}), [k]: n + 1 }; setR(rr); sayTo(crewT(k), [ln(WORD[k][n % WORD[k].length])]); } }, { text: CHOICE_BYE, bye: true, pick: () => sayTo(crewT(k), [ln(BYE[k])]) }] }]); }
  // ---- crew movement ----
  function crewOut(s) { makeCrew(); for (const k in CREW) { const c = CREW[k], sp = SPOT[k], [x, z] = s.w(sp[0], sp[1]), b = BASE[k]; c.f.position.set(b[0], 0, b[1]); c.mode = 'site'; c.show = true; c.hideAt = false; c.tx = x; c.tz = z; const [lx, lz] = s.w(sp[0], sp[1] + 2); c.face = Math.atan2(lx - x, lz - z); } }
  function crewHome() { for (const k in CREW) { const c = CREW[k], b = BASE[k]; c.tx = b[0]; c.tz = b[1]; c.face = b[2] != null ? b[2] : Math.PI; c.mode = 'leave'; c.hideAt = true; } }   // s161: walk to the truck, ride back to Meru Hardware
  function placeCrew() { const r = R(); makeCrew(); const s = r.supOK ? curStore() : null;
    for (const k in CREW) { const c = CREW[k]; if (!s) { setHome(c); continue; } c.mode = 'site'; if (s) { const sp = SPOT[k], [x, z] = s.w(sp[0], sp[1]), [lx, lz] = s.w(sp[0], sp[1] + 2); c.f.position.set(x, 0, z); c.tx = x; c.tz = z; c.face = Math.atan2(lx - x, lz - z); c.show = true; }
      else { const b = BASE[k]; c.f.position.set(b[0], 0, b[1]); c.tx = b[0]; c.tz = b[1]; c.face = b[2] != null ? b[2] : Math.PI; c.show = k === 'dozer'; } c.f.rotation.y = c.face; c.hideAt = false; } }
  // ================= sync the stores to the save =================
  let lastSig = '';
  function syncAll(force) { const r = R(), pg = prog(), rdy = ready(), sig = JSON.stringify([r.done, r.cur, r.jobs, rdy, pg.magpie, !!window.__outlets, !!r.supOK]); if (!force && sig === lastSig) return; lastSig = sig;
    for (const s of STORES) { const j = jobsOf(s, r), rep = !!r.done[s.key], P = s.P; P.skin.visible = !!j.carp; P.lit.visible = !!j.elec; P.sign.visible = !!j.sign; s.signM.color.setHex(j.elec ? 0xffffff : 0x8a8a8a); s.winM.color.set(j.elec ? '#ffe2a8' : '#2a3440');
      if (P.pylon) P.pylon.visible = !!j.sign; P.wires.visible = !j.elec; P.pipeBad.visible = !j.plumb; P.pipeOk.visible = !!j.plumb; P.slabBad.visible = !j.cement; P.slabOk.visible = !!j.cement; P.debOut.visible = !j.sweep; P.debIn.visible = !j.sweep;
      const site = r.cur === s.key && !!r.supOK; P.site.visible = site; for (const c of s.siteCols) ON(c, site); P.poster.visible = rep && !s.opened;
      if (j.sweep) clearDoorBarriers(s); if (rep) resetInside(s); }
    BASEG.visible = rdy; ON(truckCol, rdy); if (!CREW.dozer) placeCrew(); }
  function clearDoorBarriers(s) { const O = window.__outlets; if (!O || !O.B) return; const [x, z] = s.w(0, 3.4); for (const b of O.B) if (Math.hypot(b.x - x, b.z - z) < 3.2 && b.g.visible) { b.g.visible = false; b.broken = true; if (b.col) b.col.on = false; } }
  function resetInside(s) { if (s.insideOk) return; const O = window.__outlets, S2 = O && O.STORES && O.STORES.find(q => q.key === s.key); if (!S2 || !S2.def) { lastSig = ''; return; } try { S2.def.reset(); for (const b of S2.def.bars || []) { b.hp = b.hp0; b.broken = false; if (b.col) b.col.on = true; } s.insideOk = true; } catch (e) { s.insideOk = true; } }
  // ================= particles: sparks off the junction box, drips off the broken pipe =================
  const FX = [], sG = new THREE.SphereGeometry(0.05, 5, 3), sM = new THREE.MeshBasicMaterial({ color: YEL }), dM2 = new THREE.MeshBasicMaterial({ color: '#7fb6dc' });
  const emit = (x, y, z, n, mat, sp = 2, up = 2) => { for (let i = 0; i < n; i++) { if (FX.length > 40) return; const m = new THREE.Mesh(sG, mat); m.position.set(x, y, z); scene.add(m); FX.push({ m, v: V(rnd(-sp, sp), rnd(0, up), rnd(-sp, sp)), t: 0.7 }); } };
  // ================= talk + prompt =================
  const dist = (P, x, z) => Math.hypot(P.x - x, P.z - z);
  function nearCrew(P, r = 1.9) { for (const k in CREW) { const c = CREW[k]; if (c.mode !== 'home' && c.show && c.f.visible && dist(P, c.f.position.x, c.f.position.z) < r) return k; } return null; }   // s161: at Meru Hardware the hardware module talks to them
  function ringAt(P) { const s = curStore(); if (!s || !R().supOK) return null; for (const j of JOBS) { const [x, z] = s.w(j.u, j.v); if (dist(P, x, z) < 1.05) return j; } return null; }
  const atHire = P => { const s = R().supOK ? curStore() : null; if (s) { const [x, z] = s.w(HIRE[0], HIRE[1] - 0.6); if (dist(P, x, z) < 1.2) return true; } return ready() && !R().all && dist(P, BASEHIRE[0] + 0.7, BASEHIRE[1]) < 1.3; };
  const onFoot = P => !!P && (P.y || 0) < 2 && P.x > 150 && P.x < 310 && P.z > -360 && P.z < -262;
  function prompt(P) { if (busy || !ready() || !onFoot(P)) return null; const j = ringAt(P); if (j) return ((R().jobs || {})[j.k] ? '\u2713 ' : '') + 'START \u00b7 ' + j.name;
    if (atHire(P)) return 'NOW HIRING \u00b7 START WORK'; const k = nearCrew(P); if (k) return 'TALK \u00b7 ' + CREWDEF[k].name.toUpperCase(); return null; }
  function talk(P) { lastP = P; if (busy === 'job') return true; if (busy) return false; if (!ready() || !onFoot(P)) return false; const j = ringAt(P); if (j) { startJob(j.k); return true; }
    if (atHire(P)) { tone(1320, 0.05, 0.5); if (curStore()) startJob(nextJob()); else dozerMenu(); return true; }
    const k = nearCrew(P); if (k) { tone(1320, 0.05, 0.5); if (k === 'dozer') dozerMenu(); else helperMenu(k); return true; } return false; }
  // ================= town greetings (after all five): the helpers' real foxes say hello =================
  let townList = [], townScan = 3, townCd = {}; const TOWNK = new Set(Object.keys(TOWN));
  const showing = o => { for (let q = o; q; q = q.parent) if (q.visible === false) return false; return true; };
  const tw = V();
  // ================= player hard hat (worn with the HARD HAT CREW outfit) =================
  let worn = null; function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P || !U.P.head) return; const o = save.data && save.data.outfit, on = !!(o && o.name === HAT.name);
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (worn && worn.on === on && worn.fox === fox && (!worn.g || onFox(worn.g))) return; if (worn && worn.g && worn.g.parent) worn.g.parent.remove(worn.g); worn = { on, fox, g: on ? hardHat(U.P.head) : null }; }
  function useItem(id) { if (id === 'toolBelt' && save.count && save.count('toolBelt')) { toast("DOZER'S TOOL BELT \u00b7 MM. STILL SMELLS OF SAWDUST", 2.6); return true; } return false; }
  // ================= per frame =================
  let syncT = 0, rdyNow = false, barkCd = 4;
  function tick(dt, P, fox) { if (!P) return; lastP = P; lastFox = fox; const t = performance.now() / 1000; if (toastT > 0) toastT -= dt;
    if ((syncT -= dt) <= 0) { syncT = 0.5; rdyNow = ready(); syncAll(); if (rdyNow && !save.stat('hwCrewHint', false)) { save.setStat('hwCrewHint', true); toast('THE OUTLETS NEED FIXING \u00b7 FIND DOZER AT MERU HARDWARE (SKATE ROAD)', 5); } }
    const near = dist(P, 231, -310) < 170; for (const s of STORES) s.G.visible = near; BASEG.visible = rdyNow && near;
    try { applyWear(fox); } catch (e) {}
    // particles
    for (let i = FX.length - 1; i >= 0; i--) { const q = FX[i]; q.t -= dt; q.v.y -= 9 * dt; q.m.position.addScaledVector(q.v, dt); if (q.t <= 0 || q.m.position.y < 0) { scene.remove(q.m); FX.splice(i, 1); } }
    if (near && Math.random() < dt * 2) { const r = R(); for (const s of STORES) { if (dist(P, s.c[0], s.c[1]) > 40) continue; const j = jobsOf(s, r); if (!j.elec && Math.random() < 0.5) { const [x, z] = s.w(9.6, 0.8); emit(x, 1.3, z, 5, sM, 1.6, 2.4); } if (!j.plumb) { const [x, z] = s.w(-10.6, 0.6); emit(x, 2.7, z, 2, dM2, 0.2, 0); } } }
    // sliding doors on the new fronts
    for (const s of STORES) { if (!s.P.skin.visible) continue; const want = dist(P, s.c[0], s.c[1]) < 3.6 ? 1 : 0; s.doorOpen += (want - s.doorOpen) * Math.min(1, dt * 6); for (const d of s.doors) d.position.x = d.userData.sx * (0.7 + s.doorOpen * 1.3); }
    // crew walk + idle work (s161: home = their Meru Hardware department, site = today's store, leave = walking back to the truck)
    makeCrew(); const nearHW = dist(P, HW.c[0], HW.c[1]) < 70, workNow = !!(curStore() && R().supOK);
    for (const k in CREW) { const c = CREW[k], f = c.f, dx = c.tx - f.position.x, dz = c.tz - f.position.z, d = Math.hypot(dx, dz); f.visible = c.show && (c.mode === 'home' ? nearHW : near); let spd = 0;
      if (d > 0.08) { const s2 = Math.min(d, 2.8 * dt); f.position.x += dx / d * s2; f.position.z += dz / d * s2; f.rotation.y = Math.atan2(dx, dz); spd = 2.8; }
      else { if (c.hideAt) { setHome(c); } let a = c.face; if (!busy && dist(P, f.position.x, f.position.z) < 3.4) a = Math.atan2(P.x - f.position.x, P.z - f.position.z); f.rotation.y += Math.atan2(Math.sin(a - f.rotation.y), Math.cos(a - f.rotation.y)) * Math.min(1, dt * 4); }
      if (f.visible) { kit.animFox(f, dt, spd); const A = f.userData.P && f.userData.P.arms; if (!spd && A && A[1] && workNow && c.mode === 'site' && k !== 'dozer') { A[1].rotation.x = -1.0 + Math.sin(t * 6 + k.length) * 0.35; } }
      const cf = c.col.f, x = f.position.x, z = f.position.z, rr = c.k === 'dozer' ? 0.5 : 0.35; cf[0] = x - rr; cf[1] = x + rr; cf[2] = z - rr; cf[3] = z + rr; c.col.on = f.visible; }
    if (!rdyNow) { hideCard(); return; }
    // rings at today's store
    const s = R().supOK ? curStore() : null; if (!rings.length) for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.84, 32), ringM); m.rotation.x = -Math.PI / 2; m.userData.noCull = true; scene.add(m); rings.push(m); }
    const rj = R().jobs || {}; JOBS.forEach((j, i) => { const m = rings[i]; m.visible = !!s && !busy && near; if (!s) return; const [x, z] = s.w(j.u, j.v); m.position.set(x, 0.04, z); m.material = rj[j.k] ? ringDone : ringM; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + i)); });
    // proximity barks (once in a while, near a crew fox)
    barkCd -= dt; if (barkCd <= 0 && !busy) { const k = nearCrew(P, 4.5); if (k && t - (CREW[k].bark || 0) > 22) { CREW[k].bark = t; barkCd = 8; const L2 = R().all && k === 'dozer' ? DZ.after : BARK[k]; toast(CREWDEF[k].name.toUpperCase() + ': ' + L2[Math.floor(Math.random() * L2.length)], 2.6); if (k === 'dozer') hum(); } else barkCd = 1; }
    // progress card at the site / by the truck
    if (!busy && onFoot(P)) { const r = R(); if (s && dist(P, s.c[0], s.c[1]) < 16) { const key = 'site' + s.key + JSON.stringify(rj); setCard(key, '<div style="background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px">REPAIR \u00b7 ' + s.name + '</div><div style="padding:8px 10px 10px"><div style="font-size:12px;font-weight:800">Step in a ring or talk to the crew.</div>' + chips(JOBS.map(j => [j.name, rj[j.k]])) + '</div>'); }
      else if (dist(P, 173, -306) < 9 && !r.all) setCard('base' + nFixed(r) + r.cur + (r.lastDay === day()), '<div style="background:#201e1d;color:#ffd23a;padding:6px 10px;font-weight:900;font-size:13px">DOZER & CO. \u00b7 ' + nFixed(r) + ' / 5 FIXED</div><div style="padding:8px 10px 10px"><div style="font-size:12px;font-weight:800">' + (r.cur ? (r.supOK ? 'Today: ' + SK[r.cur].name + '.' : 'Today: ' + SK[r.cur].name + '. Supply run at Meru Hardware first.') : r.lastDay === day() ? 'Done for today. Sleep, then come back.' : 'One store a day. Dozer is at MERU HARDWARE on the skate road.') + '</div>' + chips(STORES.map(q => [q.name, r.done[q.key]])) + '</div>');
      else hideCard(); } else hideCard();
    // job tick + draw + hint after 3 s
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'job' && J) { const D = GD[J.g]; try { J.idle += dt; D.tick && D.tick(dt); if (J && busy === 'job') { const C = fitCv(J.cv); if (C) D.draw(C.g, C.w, C.h); if (J.idle > 3 && !J.hinted) { J.hinted = true; pulse(PANEL.querySelector('[data-go]') || J.cv); } } } catch (e) { console.warn('crew job: ' + (e && e.stack || e)); quit(); } }
    // town greetings (helpers' own foxes, after all five)
    if (R().all && !busy && (townScan -= dt) <= 0) { townScan = 0.5; if (!townList.length || (t | 0) % 20 === 0) { townList = []; scene.traverse(o => { if (o.userData && TOWNK.has(o.userData.foxKey)) townList.push(o); }); }
      for (const o of townList) { if (!showing(o)) continue; o.getWorldPosition(tw); if (Math.hypot(tw.x - P.x, tw.z - P.z) < 4 && Math.abs(tw.y - (P.y || 0)) < 3) { const k = o.userData.foxKey; if (t - (townCd[k] || -999) > 120) { townCd[k] = t; const Ls = TOWN[k]; toast(Ls[Math.floor(Math.random() * Ls.length)], 3); break; } } } } }
  const rings = [], ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringDone = new THREE.MeshBasicMaterial({ color: '#7cff9b', transparent: true, opacity: 0.6, depthWrite: false });
  syncAll(true);
  const API = { prompt, talk, tick, camFix() {}, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), STORES, GD,
    get R() { return R(); }, ready, pick: k => pickStore(SK[k]), begin: g => { busy = 'intro'; begin(g); }, finish: () => { if (J) { J.miss = 0; finishJob(); } },
    fix: k => { const r = R(); r.cur = k; r.jobs = Object.fromEntries(JOBS.map(j => [j.k, true])); setR(r); storeFixed(SK[k]); }, nextDay: () => save.setStat('meru2Day', day() + 1),
    reset: () => { setR(null); for (const s of STORES) s.insideOk = false; syncAll(true); placeCrew(); },
    supState: () => { const r = R(); return r.cur ? { cur: r.cur, got: r.sup || {}, ok: !!r.supOK } : null; }, supPick, supplied, crewOut: () => { const r = R(); return !!(ready() && r.cur && r.supOK); },
    fox: k => { makeCrew(); return CREW[k] ? CREW[k].f : null; }, name: k => (CREWDEF[k] ? CREWDEF[k].name : ''), word: k => { const rr = R(), n = (rr.friend || {})[k] || 0; rr.friend = { ...(rr.friend || {}), [k]: n + 1 }; setR(rr); return (WORD[k] || ['Mm.'])[n % (WORD[k] || ['Mm.']).length]; },
    dozerTalk: extra => dozerMenu(extra || []), ready, home: () => { for (const k in CREW) setHome(CREW[k]); },
    markOpen: k => { const s = SK[k]; if (!s || s.opened) return; s.opened = true; s.signM.map = board(s.name, 'NOW OPEN \u00b7 ' + s.sub, s.bg, s.fg, s.bar); s.signM.needsUpdate = true; s.P.poster.visible = false; },   // s155: worlds/meru2-outlet-open.js
    dispose() { card.remove(); PANEL.remove(); } };
  window.__crew = API; return API;
}
