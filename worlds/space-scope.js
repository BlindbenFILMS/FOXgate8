// 8 GATES · SPACE MAP · THE SCOPE (s574, Ben: "a FREEZE TIME special targeting function, like Fallout's called shots, for space ships").
// Opened from the SCOPE (the banner's scope icon, the menu circle when foes are near, the menu's ENTER SCOPE row, Q / 4 on desktop).
// TIME FREEZES. The camera swings onto the target and its SYSTEMS light up as called-shot zones, each with a live hit % and what it does:
//   HULL (reliable) · ENGINES (SLOWED 8 s) · GUNS (JAMMED 7 s) · BRIDGE (x2.6 CRITICAL + STUNNED 2 s, low odds)
//   hacked MACHINE FLEET ships show a SIGNAL NODE instead of the bridge: a hit knocks the hack loose (x1.6, its real voice breaks through).
//   CREATURES: BODY + WEAK SPOT.
// Queue up to 3 shots across any targets in range (◀ ▶ cycles), each costs SCOPE CHARGE (energy). EXECUTE = slow motion: the camera sits over your
// shoulder, each round flies in turn (a miss goes visibly wide), hits pop the effect, then time snaps back. Every value is in ZONES / CFG below.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
const CFG = { range: 140, sweet: 38, cost: 12, pip: 12, pips: 8, max: 3, freeze: 0.002, slowmo: 0.16, fly: 0.84, stop: 0.1, stopCrit: 0.3, hold: 0.72, kill: 1.7, dmg: 16, combo: 1.5 };   // s587 (Ben): the cinema shots twice as long (~2 s each, the first ~4 s)
const HINT_KEY = 'scope.hint.v1';
// s581 WEAPON CHOICE (Ben: "one reason to enter the scope is to pause and choose a weapon that is on board, not the one on the special button"):
// a weapon rail in the scope. Each queued shot carries its own weapon, with its own scope trait. u = charge pips (1 pip = CFG.pip EN). EQUIP puts it on button 2.
const WEAPONS = [
  { k: 'laser', name: 'LASER', short: 'CALLED SHOT', col: '#ffd23a', u: 1, dmg: 1, odds: 1, size: 1 },
  { k: 'torpedo', spec: 'PLASMA_TORPEDO', name: 'TORPEDO', short: 'x1.1 · GUIDED', col: '#ff8a3a', u: 1, dmg: 1.1, odds: 0.8, size: 2.2 },   // s586: guided toward the aim, half as sure as the missile
  { k: 'missile', spec: 'MISSILE', name: 'MISSILE', short: 'x2.2 · SEEKS', col: '#5fb8ff', u: 2, dmg: 2.2, odds: 1.4, size: 1.5 },   // s586: heat-seeking, almost always hits, = 2 torpedoes
  { k: 'lance', spec: 'RED_CANNON', name: 'LANCE', short: '+ BURNS HULL', col: '#ff5a1f', u: 2, dmg: 1.6, odds: 1, size: 1.6 },
  { k: 'rail', spec: 'RAIL', name: 'RAIL', short: 'PIERCES', col: '#cfe6ff', u: 2, dmg: 1.5, odds: 1.1, size: 0.9 },
  { k: 'flak', spec: 'FLAK', name: 'FLAK', short: 'EVERY SYSTEM', col: '#ffe08a', u: 1, dmg: 0.45, odds: 1.2, size: 1.2, fx: 'HITS EVERY SYSTEM' },
  { k: 'mines', spec: 'MINES', name: 'MINE', short: 'x1.3 + SLOW', col: '#ff3a6a', u: 1, dmg: 1.3, odds: 0.85, size: 1.4 },
  { k: 'web', spec: 'WEB', name: 'WEB', short: 'HOLDS 4 S', col: '#e8f4ff', u: 1, dmg: 0, odds: 1.15, size: 1.6, fx: 'HOLDS IT + ITS PACK' },
  { k: 'arc', spec: 'ARC', name: 'ARC', short: 'LEAPS x2', col: '#b48cff', u: 2, dmg: 0.9, odds: 1.05, size: 1.1 },
  { k: 'emp', spec: 'EMP', name: 'EMP', short: 'JAMS ALL GUNS', col: '#7df9ff', u: 2, dmg: 0.3, odds: 1.3, size: 1.8, fx: 'JAMS EVERY GUN NEAR' }];
const WK = Object.fromEntries(WEAPONS.map(w => [w.k, w]));
const ZONES = {
  hull: { name: 'HULL', odds: 0.95, mul: 1.0, fx: 'SOLID HIT', col: '#f3f2f2' },
  engines: { name: 'ENGINES', odds: 0.75, mul: 0.7, fx: 'SLOWS IT', col: '#ff8a3a', debuff: ['slowT', 8], done: 'ENGINES HIT · SLOWED' },
  guns: { name: 'GUNS', odds: 0.62, mul: 0.6, fx: 'JAMS ITS GUNS', col: '#7fd0ff', debuff: ['jamT', 7], done: 'GUNS HIT · JAMMED' },
  bridge: { name: 'BRIDGE', odds: 0.4, mul: 2.6, fx: 'CRITICAL + STUN', col: '#ec3013', debuff: ['stunT', 2], done: 'CRITICAL · STUNNED' },
  body: { name: 'BODY', odds: 0.95, mul: 1.0, fx: 'SOLID HIT', col: '#f3f2f2' },
  weak: { name: 'WEAK SPOT', odds: 0.45, mul: 2.4, fx: 'CRITICAL', col: '#ec3013', done: 'CRITICAL' },
};
// part spots in the target's own frame, in half-lengths (nose = -z)
const SHIP_PARTS = [['bridge', 0, -0.5, 0.7], ['guns', 0.5, -0.15, 0.3], ['hull', -0.15, 0.1, 0.45], ['engines', 0, 0.85, 0.3]];
const BEAST_PARTS = [['body', 0, 0, 0.6], ['weak', 0, -0.6, 0.9]];
const CLASS_NAME = { scout: 'PIRATE SCOUT', fighter: 'PIRATE CRUISER', gunner: 'PIRATE GUNNER', machine: 'MACHINE FLEET (HACKED)' };

export function createScope(X) {
  const { THREE, scene, camera, container, St, combat, beasts, burst, toast, snd, glowPop, W, H, ship, muzzle, getEn, spendEn } = X;
  const SC = { wk: 'laser', on: false, phase: null, t: 0, tgts: [], ti: 0, q: [], fx: [], bolts: [], k: 1, blend: 0, camP: new THREE.Vector3(), camL: new THREE.Vector3(), fromP: new THREE.Vector3(), fromL: new THREE.Vector3() };
  const V = () => new THREE.Vector3(), _a = V(), _b = V(), _c = V(), _up = new THREE.Vector3(0, 1, 0);
  // s577 THE SCOPE'S OWN SOUNDS (synth, no files): freeze whoosh · scan hum · lock chirp · queue tick · impact thud · crit ring · SURGICAL chord · unfreeze
  let AC = null; const ac = () => { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} return AC; };
  const noiseBuf = () => { const a = ac(); if (!a) return null; if (!SC.nb) { const b = a.createBuffer(1, a.sampleRate, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; SC.nb = b; } return SC.nb; };
  function tone(type, f0, f1, dur, vol, at = 0) { const a = ac(); if (!a) return; const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05); }
  function noise(f0, f1, dur, vol, q = 1.2, at = 0) { const a = ac(), nb = noiseBuf(); if (!a || !nb) return; const t = a.currentTime + at, n = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(); n.buffer = nb; bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); n.connect(bp).connect(g).connect(a.destination); n.start(t); n.stop(t + dur + 0.05); }
  const SFX = { freeze() { noise(3200, 180, 0.5, 0.35, 0.8); tone('sine', 220, 55, 0.6, 0.25); }, scan() { tone('sawtooth', 110, 140, 0.7, 0.05); tone('sine', 660, 990, 0.7, 0.03); }, chirp(i = 0) { tone('sine', 1100 + i * 140, 1700 + i * 140, 0.07, 0.12); },
    tick() { tone('square', 880, 880, 0.045, 0.07); }, deny() { tone('square', 220, 160, 0.12, 0.08); }, fire() { noise(1800, 600, 0.18, 0.22, 2); tone('sawtooth', 520, 160, 0.16, 0.1); }, whiz() { noise(900, 2600, 0.35, 0.08, 4); },
    hit() { noise(900, 120, 0.3, 0.45, 0.7); tone('sine', 120, 45, 0.35, 0.4); }, crit() { SFX.hit(); tone('triangle', 1760, 1320, 0.6, 0.14, 0.03); tone('sine', 2640, 2200, 0.5, 0.06, 0.05); }, miss() { noise(2400, 4000, 0.22, 0.07, 6); },
    surgical() { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.5, 0.12, i * 0.07)); }, unfreeze() { noise(200, 2800, 0.4, 0.2, 0.8); }, boom() { noise(500, 60, 1.1, 0.6, 0.5); tone('sine', 70, 28, 1.1, 0.5); } };
  // ---------- targets + parts ----------
  const isBeast = o => !!o.fam;
  const nameOf = o => isBeast(o) ? (o.D && o.D.name || 'CREATURE').toUpperCase() : (o.fleet ? 'PATROL SHIP' : CLASS_NAME[o.cls] || 'PIRATE');
  const hpOf = o => [Math.max(0, o.hp), isBeast(o) ? (o.D && o.D.hp || o.hp) : o.C.hp];
  const _bx = new THREE.Box3(), _bb = new THREE.Box3();
  const halfOf = o => { if (o._sh) return o._sh; const g = o.g || o.m; let h = isBeast(o) ? 3.2 * ((o.D && o.D.sc) || 1) : o.C.size * 0.5;   // s582: the real size, from the model (meshes only, measured unrotated), cached
    if (g && g.traverse) { const ry = g.rotation.y; g.rotation.y = 0; g.updateMatrixWorld(true); _bx.makeEmpty(); g.traverse(n => { if (n.isMesh && n.visible && n.geometry && !(n.material && n.material.side === THREE.BackSide)) { if (!n.geometry.boundingBox) n.geometry.computeBoundingBox(); _bb.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld); _bx.union(_bb); } }); g.rotation.y = ry; g.updateMatrixWorld(true);
      if (!_bx.isEmpty()) { const w = _bx.max.x - _bx.min.x, l = _bx.max.z - _bx.min.z; if (isFinite(w) && isFinite(l)) h = clamp(Math.max(w, l) * 0.5 * 0.92, h * 0.6, h * 3.5); } }
    o._sh = h; return h; };
  const alive = o => o && !o.dead && (isBeast(o) ? o.state !== 'die' : o.mode === 'fight');
  function list() { const out = []; for (const p of combat.list) if (alive(p) && Math.hypot(p.x - St.x, p.z - St.z) < CFG.range) out.push(p); for (const c of beasts.list) if (c.fam !== 'belt' && alive(c) && Math.hypot(c.x - St.x, c.z - St.z) < CFG.range) out.push(c);
    return out.sort((a, b) => Math.hypot(a.x - St.x, a.z - St.z) - Math.hypot(b.x - St.x, b.z - St.z)); }
  const partsOf = o => isBeast(o) ? BEAST_PARTS : SHIP_PARTS;   // s577 (Ben): the Machine Fleet is treated like the others for now
  function partPos(o, part, out) { const L = halfOf(o), h = o.h || 0, lx = part[1] * L, lz = part[2] * L; out.set(o.x + lx * Math.cos(h) - lz * Math.sin(h), (part[3] || 0.4) * Math.min(3, L * 0.45), o.z + lx * Math.sin(h) + lz * Math.cos(h)); return out; }
  function odds(o, key, wk) { const W = WK[wk || SC.wk] || WEAPONS[0]; const d = Math.hypot(o.x - St.x, o.z - St.z), base = d < CFG.sweet ? 0.95 : lerp(0.95, 0.3, clamp((d - CFG.sweet) / (CFG.range - CFG.sweet), 0, 1)), sp = Math.hypot(o.vx || 0, o.vz || 0), mv = 1 - Math.min(0.22, sp / 110);
    const stun = o.stunT > 0 ? 1.15 : 1; return clamp(base * ZONES[key].odds * mv * stun * W.odds, 0.05, 0.95); }
  const units = () => SC.q.reduce((n, q) => n + (WK[q.w] || WEAPONS[0]).u, 0), capU = () => Math.min(CFG.pips, Math.floor(getEn() / CFG.pip));
  const avail = () => St.phase === 'free' && !St.menu && list().length > 0;
  const nearest = () => { const L = list(); return L.length ? Math.hypot(L[0].x - St.x, L[0].z - St.z) : 1e9; };
  // ---------- DOM: inverted Modernist (dark ground, light ink, 2px rules, red accent, flush left) ----------
  const ov = document.createElement('div'); ov.style.cssText = 'position:absolute;inset:0;z-index:40;display:none;font-family:Archivo,Arial,sans-serif;color:#f3f2f2;user-select:none;-webkit-user-select:none;touch-action:none';
  ov.innerHTML = '<div data-veil style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 42%,rgba(0,0,0,0) 38%,rgba(4,6,14,0.78) 100%),repeating-linear-gradient(0deg,rgba(243,242,242,0.035) 0 1px,transparent 1px 4px)"></div>'
    + '<svg data-lines style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible"></svg><div data-tags style="position:absolute;inset:0;pointer-events:none"></div>'
    + '<div data-top style="position:absolute;left:0;right:0;top:0;display:flex;align-items:stretch;background:#201e1d;border-bottom:2px solid #f3f2f2;padding-top:env(safe-area-inset-top)">'
    + '<div style="background:#ec3013;color:#fff;font:900 15px Archivo,sans-serif;letter-spacing:0.12em;padding:12px 14px;display:flex;align-items:center;gap:8px;white-space:nowrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 1v5M12 18v5M1 12h5M18 12h5"></path></svg>SCOPE</div>'
    + '<div data-state style="flex:1;min-width:0;padding:8px 14px;display:flex;flex-direction:column;justify-content:center;gap:2px;border-right:2px solid #3a3836"><span data-s1 style="font:800 11px Archivo,sans-serif;letter-spacing:0.14em;color:#ffd23a">TIME FROZEN</span><span data-s2 style="font:700 14px Archivo,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span></div>'
    + '<div style="padding:8px 14px;display:flex;flex-direction:column;justify-content:center;gap:5px;min-width:120px"><span style="font:800 11px Archivo,sans-serif;letter-spacing:0.14em;color:#ffd23a;white-space:nowrap">CHARGE</span><div data-pips style="display:flex;gap:4px"></div></div>'
    + '<button data-x aria-label="Close the scope" style="width:52px;border:0;border-left:2px solid #3a3836;border-radius:0;background:#201e1d;color:#f3f2f2;font:900 20px Archivo,sans-serif;cursor:pointer">✕</button></div>'
    + '<div data-bot style="position:absolute;left:0;right:0;bottom:0;background:#201e1d;border-top:2px solid #f3f2f2;padding-bottom:env(safe-area-inset-bottom);display:flex;flex-direction:column">'
    + '<div style="display:flex;align-items:stretch;border-bottom:2px solid #3a3836"><div data-wr style="flex:1;min-width:0;display:flex;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch"></div><button data-eq style="min-width:92px;min-height:52px;border:0;border-left:2px solid #f3f2f2;border-radius:0;background:#201e1d;color:#f3f2f2;font:900 12px Archivo,sans-serif;letter-spacing:0.08em;text-align:left;padding:0 10px;cursor:pointer">EQUIP ON 2</button></div>'
    + '<div style="display:flex;flex-wrap:wrap;align-items:stretch">'
    + '<div style="flex:1 1 280px;min-width:0;display:flex;align-items:stretch;min-height:56px;border-right:2px solid #3a3836"><button data-prev aria-label="Previous target" style="width:48px;border:0;border-radius:0;background:#201e1d;color:#f3f2f2;font:900 20px Archivo,sans-serif;cursor:pointer;border-right:2px solid #3a3836">◀</button>'
    + '<div style="flex:1;min-width:0;padding:6px 12px;display:flex;flex-direction:column;justify-content:center;gap:5px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><span data-tn style="flex:1;min-width:0;font:900 14px Archivo,sans-serif;letter-spacing:0.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span><span data-tc style="font:800 12px Archivo,sans-serif;color:#b8b4b0;white-space:nowrap"></span></div><div style="height:8px;background:#3a3836"><div data-hp style="height:100%;background:#ec3013;width:50%;transition:width 0.25s"></div></div></div>'
    + '<button data-next aria-label="Next target" style="width:48px;border:0;border-radius:0;background:#201e1d;color:#f3f2f2;font:900 20px Archivo,sans-serif;cursor:pointer;border-left:2px solid #3a3836">▶</button></div>'
    + '<div style="flex:1 1 380px;min-width:0;display:flex;align-items:stretch;min-height:56px"><div data-q style="flex:1;min-width:0;display:flex"></div>'
    + '<button data-clr aria-label="Clear the queue" style="min-width:64px;border:0;border-left:2px solid #3a3836;border-radius:0;background:#201e1d;color:#f3f2f2;font:900 12px Archivo,sans-serif;letter-spacing:0.08em;text-align:left;padding:0 12px;cursor:pointer">CLEAR</button>'
    + '<button data-go style="min-width:128px;border:0;border-radius:0;background:#ec3013;color:#fff;font:900 16px Archivo,sans-serif;letter-spacing:0.1em;text-align:left;padding:0 14px;cursor:pointer;display:flex;flex-direction:column;justify-content:center;gap:2px"><span>EXECUTE</span><span data-gon style="font:800 11px Archivo,sans-serif;letter-spacing:0.08em;white-space:nowrap"></span></button></div></div></div>'
    + '<div data-flash style="position:absolute;inset:0;pointer-events:none;background:#dff4ff;opacity:0"></div>'
    + '<div data-run style="position:absolute;left:0;right:0;top:0;display:none;align-items:center;gap:10px;background:#201e1d;border-bottom:2px solid #ec3013;padding:10px 14px;padding-top:calc(10px + env(safe-area-inset-top));font:900 14px Archivo,sans-serif;letter-spacing:0.12em"><span style="width:10px;height:10px;background:#ec3013"></span><span data-rt>EXECUTING</span></div>';
  container.appendChild(ov);
  const $ = s => ov.querySelector('[data-' + s + ']'), tags = $('tags'), lines = $('lines');
  const tap = (el, f) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); f(e); });
  tap($('x'), () => exit(true)); $('q').addEventListener('pointerdown', e => { const b = e.target.closest('[data-slot]'); if (!b || SC.phase !== 'aim') return; e.preventDefault(); e.stopPropagation(); SC.q.splice(+b.dataset.slot, 1); SFX.deny(); panel(); layoutTags(); }); tap($('eq'), () => { const W = WK[SC.wk]; if (!W.spec || !X.equip) { SFX.deny(); return; } X.equip(W.spec); SFX.tick(); rail(); }); tap($('prev'), () => cycle(-1)); tap($('next'), () => cycle(1)); tap($('clr'), () => clearQ()); tap($('go'), () => execute());
  ['pointermove', 'pointerup', 'wheel'].forEach(k => ov.addEventListener(k, e => e.stopPropagation()));
  function rail() { const r = $('wr'); if (!r) return; const eq = X.equipped ? X.equipped() : null;
    r.innerHTML = WEAPONS.map(W => { const on = W.k === SC.wk, isEq = W.spec && W.spec === eq; return '<button data-w="' + W.k + '" aria-label="' + W.name + '" style="flex:0 0 auto;min-width:86px;min-height:52px;border:0;border-right:2px solid #3a3836;border-radius:0;background:' + (on ? '#ec3013' : '#201e1d') + ';color:' + (on ? '#fff' : '#f3f2f2') + ';text-align:left;padding:5px 9px;cursor:pointer;display:flex;flex-direction:column;justify-content:center;gap:2px">'
      + '<span style="display:flex;align-items:center;gap:6px;font:900 13px Archivo,sans-serif;letter-spacing:0.05em"><span style="width:9px;height:9px;background:' + W.col + '"></span>' + W.name + (isEq ? '<span style="font:900 10px Archivo,sans-serif;padding:1px 4px;background:#f3f2f2;color:#201e1d">2</span>' : '') + '</span>'
      + '<span style="font:700 11px Archivo,sans-serif;white-space:nowrap;color:' + (on ? '#fff' : '#b8b4b0') + '">' + W.short + ' · ' + '▮'.repeat(W.u) + '</span></button>'; }).join('');
    r.querySelectorAll('[data-w]').forEach(b => { tap(b, () => pickW(b.dataset.w)); b.addEventListener('mouseenter', () => { if (b.dataset.w !== SC.wk) b.style.background = '#4a1a12'; }); b.addEventListener('mouseleave', () => { if (b.dataset.w !== SC.wk) b.style.background = '#201e1d'; }); });
    const W = WK[SC.wk], e2 = $('eq'); e2.style.display = W.spec ? 'block' : 'none'; e2.textContent = W.spec === eq ? 'ON 2 ✓' : 'EQUIP ON 2'; e2.style.background = W.spec === eq ? '#f3f2f2' : '#201e1d'; e2.style.color = W.spec === eq ? '#201e1d' : '#f3f2f2'; }
  function pickW(k) { if (!WK[k] || SC.phase !== 'aim') return; SC.wk = k; SFX.chirp(2); rail(); const keep = tagEls.map(t => t.shown); buildTags(); tagEls.forEach((t, i) => { if (keep[i] || SC.scanT > 0.6) { t.shown = true; t.el.style.opacity = t.mk.style.opacity = t.ln.style.opacity = '1'; } }); SC.scanT = Math.max(SC.scanT, 0.61); panel(); }
  // one tag per part (built per target): a square marker on the part + a leader line + a label box you tap
  let tagEls = [];
  function buildTags() { tags.innerHTML = ''; lines.innerHTML = ''; tagEls = []; const o = SC.tgts[SC.ti]; if (!o) return;
    for (const part of partsOf(o)) { const Z = ZONES[part[0]], el = document.createElement('div');
      el.style.cssText = 'position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;min-height:44px;min-width:128px;background:#201e1d;border:2px solid #f3f2f2;display:flex;align-items:stretch;transform:translate(-9999px,0);opacity:0;transition:opacity 0.12s';
      el.innerHTML = '<div data-n style="flex:1;padding:5px 10px;display:flex;flex-direction:column;justify-content:center;gap:1px"><span style="font:900 13px Archivo,sans-serif;letter-spacing:0.06em;white-space:nowrap">' + Z.name + '</span><span style="font:700 11px Archivo,sans-serif;color:#b8b4b0;line-height:1.2">' + (WK[SC.wk].fx || (WK[SC.wk].k === 'laser' ? Z.fx : Z.fx + ' · ' + WK[SC.wk].short)) + '</span></div><div data-p style="min-width:52px;padding:0 8px;display:flex;align-items:center;justify-content:flex-start;font:900 18px Archivo,sans-serif;border-left:2px solid #3a3836;font-variant-numeric:tabular-nums"></div><div data-c style="display:none;min-width:26px;align-items:center;justify-content:center;background:#ec3013;color:#fff;font:900 14px Archivo,sans-serif"></div>';
      tap(el, () => queue(o, part[0])); el.addEventListener('mouseenter', () => { el.style.background = '#4a1a12'; }); el.addEventListener('mouseleave', () => { el.style.background = '#201e1d'; });
      const mk = document.createElement('div'); mk.style.cssText = 'position:absolute;left:0;top:0;width:14px;height:14px;margin:-7px 0 0 -7px;border:2px solid ' + Z.col + ';pointer-events:none;transform:translate(-9999px,0)'; tags.appendChild(mk);
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); ln.setAttribute('stroke', '#f3f2f2'); ln.setAttribute('stroke-width', '2'); lines.appendChild(ln);
      ln.style.opacity = '0'; mk.style.opacity = '0'; tags.appendChild(el); tagEls.push({ el, mk, ln, part, p: el.querySelector('[data-p]'), c: el.querySelector('[data-c]'), shown: false }); }
    // the target bracket
    const br = document.createElement('div'); br.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;transform:translate(-9999px,0)';
    br.innerHTML = ['left:0;top:0;border-left:3px solid #ec3013;border-top:3px solid #ec3013', 'right:0;top:0;border-right:3px solid #ec3013;border-top:3px solid #ec3013', 'left:0;bottom:0;border-left:3px solid #ec3013;border-bottom:3px solid #ec3013', 'right:0;bottom:0;border-right:3px solid #ec3013;border-bottom:3px solid #ec3013'].map(s => '<div style="position:absolute;width:16px;height:16px;' + s + '"></div>').join('');
    tags.appendChild(br); SC.br = br; SC.sweep = document.createElement('div'); SC.sweep.style.cssText = 'position:absolute;left:0;top:0;width:3px;pointer-events:none;background:#7fe8ff;box-shadow:0 0 16px 4px rgba(127,232,255,0.55)'; tags.appendChild(SC.sweep); SC.scanT = 0; }
  const proj = (v, out) => { _c.copy(v).project(camera); out.x = (_c.x * 0.5 + 0.5) * W(); out.y = (-_c.y * 0.5 + 0.5) * H(); out.z = _c.z; return out; };
  function layoutTags() { const o = SC.tgts[SC.ti]; if (!o || SC.phase !== 'aim') return; const w = W(), h = H(), top = ($('top').offsetHeight || 60) + 8, bot = h - ($('bot').offsetHeight || 200) - 8;
    const c = proj(_a.set(o.x, 0.4, o.z), {}), r = Math.max(26, Math.abs(proj(_b.set(o.x + halfOf(o), 0.4, o.z), {}).x - c.x) * 1.15 + 10);
    SC.br.style.width = SC.br.style.height = (r * 2) + 'px'; SC.br.style.transform = 'translate(' + (c.x - r) + 'px,' + (c.y - r) + 'px)';
    const sk = clamp(SC.scanT / 0.6, 0, 1), sx = c.x - r * 1.3 + sk * r * 2.6; SC.sweepX = sx; SC.sweep.style.height = (r * 2.4) + 'px'; SC.sweep.style.transform = 'translate(' + sx + 'px,' + (c.y - r * 1.2) + 'px)'; SC.sweep.style.display = sk < 1 ? 'block' : 'none';
    const pts = tagEls.map(T => { const q = proj(partPos(o, T.part, _a), {}); return { T, q }; }), sides = [[], []];
    for (const P of pts) sides[P.q.x < c.x ? 0 : 1].push(P);
    if (!sides[0].length || !sides[1].length) { const all = pts.slice().sort((a, b) => a.q.y - b.q.y); sides[0] = all.filter((_, i) => i % 2 === 0); sides[1] = all.filter((_, i) => i % 2 === 1); }
    sides.forEach((S2, si) => { S2.sort((a, b) => a.q.y - b.q.y); let y = top; const lw = Math.min(190, w * 0.42);
      for (const P of S2) { const bh = P.T.el.offsetHeight || 48, bw = P.T.el.offsetWidth || 150; let ty = clamp(P.q.y - bh / 2, y, bot - bh); y = ty + bh + 8;
        const tx = si === 0 ? clamp(c.x - r - 24 - bw, 6, w - bw - 6) : clamp(c.x + r + 24, 6, w - bw - 6); if (si === 0 && tx + bw > P.q.x - 10 && w < 560) { /* narrow phone: keep the box off the marker */ }
        if (!P.T.shown && (sk >= 1 || sx >= P.q.x)) { P.T.shown = true; P.T.el.style.opacity = P.T.mk.style.opacity = P.T.ln.style.opacity = '1'; SFX.chirp(tagEls.filter(t => t.shown).length); }
        P.T.el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; P.T.el.style.width = Math.min(lw + 30, 236) + 'px'; P.T.mk.style.transform = 'translate(' + P.q.x + 'px,' + P.q.y + 'px)';
        const ex = si === 0 ? tx + bw : tx; P.T.ln.setAttribute('x1', P.q.x); P.T.ln.setAttribute('y1', P.q.y); P.T.ln.setAttribute('x2', ex); P.T.ln.setAttribute('y2', ty + bh / 2); } });
    // the % + queued count per part
    for (const T of tagEls) { T.p.textContent = Math.round(odds(o, T.part[0]) * 100) + '%'; const n = SC.q.filter(s => s.o === o && s.key === T.part[0]).length; T.c.style.display = n ? 'flex' : 'none'; T.c.textContent = n; } }
  function panel() { const o = SC.tgts[SC.ti]; $('tn').textContent = o ? nameOf(o) : 'NO TARGET'; const [hp, mx] = o ? hpOf(o) : [0, 1]; $('hp').style.width = Math.round(clamp(hp / mx, 0, 1) * 100) + '%';
    $('tc').textContent = o ? (SC.ti + 1) + ' / ' + SC.tgts.length + ' · ' + Math.round(Math.hypot(o.x - St.x, o.z - St.z)) + ' M' : '';
    const used = units(), cap = capU();
    $('pips').innerHTML = Array.from({ length: CFG.pips }, (_, i) => '<span style="width:11px;height:12px;' + (i < used ? 'background:#ec3013' : i < cap ? 'background:#f3f2f2' : 'background:#3a3836') + '"></span>').join('');
    $('s2').textContent = SC.q.length ? SC.q.length + ' SHOT' + (SC.q.length > 1 ? 'S' : '') + ' QUEUED' : cap ? 'TAP A SYSTEM TO QUEUE A SHOT' : 'NOT ENOUGH CHARGE';
    $('q').innerHTML = Array.from({ length: CFG.max }, (_, i) => { const q = SC.q[i]; if (!q) return '<div style="flex:1 1 0;min-width:0;border-left:2px solid #3a3836;display:flex;align-items:center;padding:0 10px;font:800 12px Archivo,sans-serif;color:#6e6a66;letter-spacing:0.08em">' + (i + 1) + ' · EMPTY</div>';
      const W = WK[q.w]; return '<button data-slot="' + i + '" aria-label="Remove shot ' + (i + 1) + '" style="flex:1 1 0;min-width:0;border:0;border-left:2px solid #3a3836;border-radius:0;background:#201e1d;color:#f3f2f2;text-align:left;padding:0 10px;cursor:pointer;display:flex;flex-direction:column;justify-content:center;gap:2px;box-shadow:inset 0 4px 0 ' + W.col + '">'
        + '<span style="font:900 12px Archivo,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">' + (i + 1) + ' ' + W.name + '</span><span style="font:700 11px Archivo,sans-serif;color:#d8d4d0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">' + ZONES[q.key].name + ' · ' + Math.round(odds(q.o, q.key, q.w) * 100) + '%</span></button>'; }).join('');
    const go = $('go'), on = SC.q.length > 0; go.style.background = on ? '#ec3013' : '#3a3836'; go.style.color = on ? '#fff' : '#8a8580'; go.style.cursor = on ? 'pointer' : 'default'; $('gon').textContent = on ? SC.q.length + ' SHOT' + (SC.q.length > 1 ? 'S' : '') + ' · ' + '▮'.repeat(used) : 'QUEUE A SHOT'; }
  // ---------- actions ----------
  function enter() { if (SC.on || !avail()) return false; SC.tgts = list(); if (!SC.tgts.length) return false; SC.on = true; SC.phase = 'aim'; SC.t = 0; SC.ti = 0; SC.q = []; SC.blend = 0;
    SC.fromP.copy(camera.position); camera.getWorldDirection(_a); SC.fromL.copy(camera.position).addScaledVector(_a, 30); SC.camP.copy(SC.fromP); SC.camL.copy(SC.fromL);
    ov.style.display = 'block'; $('top').style.display = 'flex'; $('bot').style.display = 'flex'; $('run').style.display = 'none'; $('veil').style.opacity = '1';
    rail(); buildTags(); panel(); SFX.freeze(); flash(0.55); setTimeout(() => SC.on && SFX.scan(), 120); xray(SC.tgts[SC.ti]); SC.hits = new Map(); SC.killO = null;
    if (!SC.hinted) { let seen = false; try { seen = !!localStorage.getItem(HINT_KEY); } catch (e) {} if (!seen) showHint(); SC.hinted = true; } return true; }
  function flash(a) { const f = $('flash'); if (!f) return; f.style.transition = 'none'; f.style.opacity = String(a); requestAnimationFrame(() => { f.style.transition = 'opacity 0.35s ease-out'; f.style.opacity = '0'; }); }
  function showHint() { const h = document.createElement('div'); h.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(360px,88vw);background:#201e1d;border:2px solid #f3f2f2;pointer-events:auto;z-index:3';
    h.innerHTML = '<div style="background:#ec3013;color:#fff;font:900 14px Archivo,sans-serif;letter-spacing:0.12em;padding:10px 14px">THE SCOPE · TIME IS FROZEN</div>' + [['1', 'TAP A SYSTEM', 'Engines slow it, guns jam it, the bridge is a big hit.'], ['2', 'PICK A WEAPON, QUEUE UP TO 3', 'Any weapon on board. Hit 3 different systems = SURGICAL.'], ['3', 'EXECUTE', 'Watch every shot land in slow motion.']].map(r => '<div style="display:flex;gap:12px;padding:10px 14px;border-top:2px solid #3a3836"><span style="min-width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:#f3f2f2;color:#201e1d;font:900 15px Archivo,sans-serif">' + r[0] + '</span><span style="display:flex;flex-direction:column;gap:2px"><span style="font:900 15px Archivo,sans-serif">' + r[1] + '</span><span style="font:600 14px Archivo,sans-serif;color:#d8d4d0">' + r[2] + '</span></span></div>').join('') + '<button style="width:100%;min-height:52px;border:0;border-top:2px solid #f3f2f2;border-radius:0;background:#201e1d;color:#f3f2f2;font:900 15px Archivo,sans-serif;letter-spacing:0.1em;text-align:left;padding:0 14px;cursor:pointer">GOT IT</button>';
    const b = h.querySelector('button'); tap(b, () => { h.remove(); SC.hint = null; try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {} SFX.tick(); }); b.addEventListener('mouseenter', () => { b.style.background = '#4a1a12'; }); b.addEventListener('mouseleave', () => { b.style.background = '#201e1d'; }); ov.appendChild(h); SC.hint = h; }
  // s578 X-RAY (Ben: "all white looks bad"): a deep-blue see-through shell with a cyan rim (fresnel) + a bright scan band that sweeps along the ship, instead of the white wireframe
  const xrMat = new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 }, uBand: { value: -1 }, uT: { value: 0 } }, transparent: true, depthWrite: false, depthTest: false, side: THREE.FrontSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(normalMatrix * normal); vec4 mv = viewMatrix * w; vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uA; uniform float uBand; uniform float uT; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ float r = pow(1.0 - clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 2.2); float lines = step(0.92, fract(vW.y * 3.0 + uT * 0.6)) * 0.25; float b = uBand < 0.0 ? 0.0 : exp(-pow((gl_FragCoord.x - uBand) / 22.0, 2.0)); vec3 deep = vec3(0.07, 0.28, 0.62), cy = vec3(0.55, 0.95, 1.0); vec3 c = mix(deep, cy, clamp(r * 1.3 + b, 0.0, 1.0)); float a = (0.38 + r * 0.55 + lines * 0.6 + b * 0.6) * uA; gl_FragColor = vec4(c + vec3(0.05, 0.12, 0.2) * lines, a); }' });
  function xray(o) { if (SC.xr) { scene.remove(SC.xr); SC.xr = null; } const src = o && (o.g || o.m); if (!src || !src.clone) return; const c = src.clone(true); c.traverse(n => { if (n.isMesh) { if (n.material && n.material.side === THREE.BackSide) n.visible = false; else { n.material = xrMat; n.renderOrder = 20; } } else if (n.isSprite || n.isPoints) n.visible = false; }); c.matrixAutoUpdate = false; c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.scale.set(1, 1, 1); scene.add(c); SC.xr = c; SC.xrO = o; SC.xrT = 0; }
  const _xs = new THREE.Matrix4().makeScale(1.03, 1.03, 1.03);
  function exit(refund) { if (!SC.on) return; if (refund && SC.q.length) SC.q = []; SC.on = false; SC.phase = 'out'; SC.t = 0; ov.style.display = 'none'; for (const B of SC.bolts) { scene.remove(B.m); scene.remove(B.g); } SC.bolts = []; SC.cur = null; SC.shake = 0;
    if (SC.xr) { scene.remove(SC.xr); SC.xr = null; } for (const F of SC.fx) F.el.remove(); SC.fx = []; if (SC.hint) { SC.hint.remove(); SC.hint = null; } SFX.unfreeze(); }
  function cycle(d) { if (SC.phase !== 'aim') return; SC.tgts = SC.tgts.filter(alive); if (!SC.tgts.length) { exit(true); return; } SC.ti = (SC.ti + d + SC.tgts.length) % SC.tgts.length; buildTags(); panel(); xray(SC.tgts[SC.ti]); if (d) SFX.scan(); }
  function queue(o, key) { if (SC.phase !== 'aim') return; if (SC.q.length >= CFG.max || units() + WK[SC.wk].u > capU()) { SFX.deny(); $('s2').textContent = SC.q.length >= CFG.max ? 'QUEUE FULL · EXECUTE' : 'NOT ENOUGH CHARGE'; return; }
    SC.q.push({ o, key, w: SC.wk }); SFX.tick(); panel(); }
  function clearQ() { if (SC.phase !== 'aim') return; SC.q = []; panel(); }
  function execute() { if (SC.phase !== 'aim' || !SC.q.length) return; spendEn(units() * CFG.pip); SC.phase = 'run'; SC.t = 0; SC.shot = 0; SC.cur = null; SC.hits = new Map(); SC.killO = null; if (SC.xr) { scene.remove(SC.xr); SC.xr = null; } if (SC.hint) { SC.hint.remove(); SC.hint = null; }
    $('top').style.display = 'none'; $('bot').style.display = 'none'; tags.innerHTML = ''; lines.innerHTML = ''; $('run').style.display = 'flex'; $('rt').textContent = 'EXECUTING · 1 / ' + SC.q.length; flash(0.3); }
  // ---------- the volley (s577 CINEMA): one shot at a time, ~1 s each: FLY (camera chases the round) → STOP (hit-stop, the world freezes on impact; longer + shake on a crit) → HOLD → next.
  // The last shot that destroys a ship gets the KILL CAM (a slow orbit as it goes down). 3 different systems hit on one ship = SURGICAL (x1.5 on the 3rd + the stamp).
  const boltGeo = new THREE.CylinderGeometry(0.22, 0.22, 2.6, 8); boltGeo.rotateX(Math.PI / 2);
  const tgtPos = (s, out) => { const o = s.o; partPos(o, partsOf(o).find(p => p[0] === s.key) || partsOf(o)[0], out); return out; };
  function fireOne(s) { const o = s.o; if (!alive(o)) { SC.fx.push(floater(o.x, o.z, 'TARGET DOWN', '#b8b4b0')); return null; }
    const W = WK[s.w] || WEAPONS[0], hit = Math.random() < odds(o, s.key, s.w), from = muzzle(SC.shot, V()), Z = ZONES[s.key];
    const m = new THREE.Mesh(boltGeo, new THREE.MeshBasicMaterial({ color: W.col, toneMapped: false })); m.scale.set(W.size, W.size, W.k === 'rail' ? 2.2 : 1); m.position.copy(from); scene.add(m);
    const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.dotTex, color: W.col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); g.scale.setScalar(3.4 * W.size); scene.add(g);
    const miss = hit ? null : (() => { const a = Math.random() * 6.28; return new THREE.Vector3(Math.cos(a), 0.3, Math.sin(a)).multiplyScalar(halfOf(o) * 1.6 + 3); })();
    const B = { m, g, from, s, hit, miss, t: 0 }; SC.bolts.push(B); glowPop && glowPop(from.x, from.y, from.z, 0xffd23a, 2.2); SFX.fire(); setTimeout(() => SC.on && SFX.whiz(), 90); return B; }
  function land(B) { const s = B.s, o = s.o, Z = ZONES[s.key], at = tgtPos(s, V()), res = { hit: false, crit: false, killed: false };
    scene.remove(B.m); scene.remove(B.g); B.m.material.dispose(); B.g.material.dispose(); SC.bolts = SC.bolts.filter(b => b !== B);
    if (!B.hit || !alive(o)) { SC.fx.push(floater(at.x + (B.miss ? B.miss.x : 0), at.z + (B.miss ? B.miss.z : 0), 'MISS', '#b8b4b0')); SFX.miss(); return res; }
    const set = SC.hits.get(o) || new Set(); set.add(s.key); SC.hits.set(o, set); const surgical = set.size >= 3 && !set.done; if (surgical) set.done = true;
    const W = WK[s.w] || WEAPONS[0], crit = (s.key === 'bridge' || s.key === 'weak') && W.dmg > 0.5, dmg = Math.round(CFG.dmg * Z.mul * W.dmg * (X.power ? X.power() : 1) * (surgical ? CFG.combo : 1));
    const hurt = (t, n, zk) => { if (n > 0) { if (isBeast(t)) beasts.hitShot({ m: { position: { x: t.x, z: t.z } }, dmg: n, missile: false }); else combat.hit(t, n); } const Z2 = ZONES[zk]; if (!isBeast(t) && Z2 && Z2.debuff && combat.debuff && W.k !== 'web' && W.k !== 'emp') combat.debuff(t, Z2.debuff[0], Z2.debuff[1] * (W.k === 'flak' ? 0.5 : 1)); };
    const others = (r, n) => list().filter(t => t !== o && alive(t) && Math.hypot(t.x - o.x, t.z - o.z) < r).slice(0, n);
    if (W.k === 'flak') { for (const P of partsOf(o)) hurt(o, Math.round(CFG.dmg * ZONES[P[0]].mul * W.dmg), P[0]); }
    else hurt(o, dmg, s.key);
    if (W.k === 'lance') hurt(o, Math.round(CFG.dmg * 0.6), 'hull');
    if (W.k === 'mines' && !isBeast(o) && combat.debuff) combat.debuff(o, 'slowT', 4);
    if (W.k === 'rail' || W.k === 'arc') for (const t of others(W.k === 'rail' ? 45 : 40, W.k === 'rail' ? 1 : 2)) { hurt(t, Math.round(dmg * 0.6), s.key); const p2 = partPos(t, partsOf(t).find(p => p[0] === s.key) || partsOf(t)[0], _c); burst(p2.x, p2.z, W.col, 12, 1.1); SC.fx.push(floater(p2.x, p2.z, (W.k === 'rail' ? 'PIERCED · ' : 'ARC · ') + Math.round(dmg * 0.6), W.col)); }
    if (W.k === 'web') { const pack = [o, ...others(12, 4)]; pack.forEach(t => X.hold && X.hold(t, 4)); SC.fx.push(floater(at.x, at.z - 2, pack.length > 1 ? 'WEBBED x' + pack.length : 'WEBBED · 4 S', W.col)); }
    if (W.k === 'emp') { const all = [o, ...others(35, 12)]; all.forEach(t => { if (!isBeast(t) && combat.debuff) combat.debuff(t, 'jamT', 5); }); SC.fx.push(floater(at.x, at.z - 2, 'EMP · ' + all.length + ' JAMMED', W.col)); if (X.ring) X.ring(o.x, o.z, 35, 0x7df9ff); }
    burst(at.x, at.z, W.k === 'laser' ? (Z.col === '#f3f2f2' ? '#ffd23a' : Z.col) : W.col, crit ? 26 : Math.round(14 * Math.max(1, W.size * 0.8)), (crit ? 1.8 : 1.2) * Math.max(1, W.size * 0.7)); burst(at.x, at.z, '#ffffff', 6, 0.7);
    if (W.k !== 'web' && W.k !== 'emp') SC.fx.push(floater(at.x, at.z, (W.k === 'flak' ? 'FLAK · ALL SYSTEMS' : (Z.done || Z.name + ' HIT')) + ' · ' + dmg, Z.col)); if (W.dmg > 0.4) scar(o, s.key);
    if (surgical) stamp('SURGICAL', '3 SYSTEMS · x' + CFG.combo + ' DAMAGE'); if (crit || surgical) SFX.crit(); else SFX.hit(); if (surgical) setTimeout(() => SFX.surgical(), 120);
    res.hit = true; res.crit = crit || surgical; res.killed = !alive(o); if (res.killed) { SC.killO = o; SFX.boom(); } return res; }
  function floater(x, z, text, col) { const el = document.createElement('div'); el.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;background:#201e1d;border:2px solid ' + col + ';color:' + (col === '#b8b4b0' ? '#b8b4b0' : '#f3f2f2') + ';font:900 15px Archivo,sans-serif;letter-spacing:0.06em;padding:6px 10px;white-space:nowrap'; el.textContent = text; ov.appendChild(el); return { el, x, z, t: 0 }; }
  function stamp(big, small) { if (SC.stamp) SC.stamp.el.remove(); const el = document.createElement('div'); el.style.cssText = 'position:absolute;left:50%;top:38%;z-index:41;pointer-events:none;background:#ec3013;color:#fff;border:3px solid #f3f2f2;padding:10px 18px;display:flex;flex-direction:column;gap:2px;transform:translate(-50%,-50%) scale(2.2) rotate(-4deg);opacity:0';
    el.innerHTML = '<span style="font:900 clamp(30px,8vw,54px) Archivo,sans-serif;letter-spacing:0.06em;line-height:1">' + big + '</span><span style="font:800 14px Archivo,sans-serif;letter-spacing:0.12em">' + small + '</span>'; container.appendChild(el); SC.stamp = { el, t: 0 }; }
  // PARTS VISIBLY BREAK (outlive the scope while the effect lasts): ENGINES = a sputtering smoke trail · GUNS = blue shorting sparks · BRIDGE / WEAK SPOT = a cracked-glass star
  const scars = []; let crackTex = null;
  const crack = () => { if (crackTex) return crackTex; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.lineCap = 'round';
    for (let i = 0; i < 9; i++) { let a = i / 9 * 6.28 + Math.random() * 0.4, px = 64, py = 64; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { a += (Math.random() - 0.5) * 0.7; px += Math.cos(a) * 14; py += Math.sin(a) * 14; x.lineTo(px, py); } x.stroke(); }
    x.beginPath(); x.arc(64, 64, 18, 0, 6.28); x.stroke(); crackTex = new THREE.CanvasTexture(c); return crackTex; };
  function scar(o, key) { if (key === 'hull' || key === 'body') return; let sp = null;
    if (key === 'bridge' || key === 'weak') { sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: crack(), color: 0xdff4ff, transparent: true, depthWrite: false, depthTest: false })); sp.scale.setScalar(Math.max(1.6, halfOf(o) * 0.8)); sp.renderOrder = 15; scene.add(sp); }
    scars.push({ o, key, t: key === 'engines' ? 8 : key === 'guns' ? 7 : 30, sp, e: 0 }); }
  function scarTick(dt) { for (let i = scars.length - 1; i >= 0; i--) { const S = scars[i], o = S.o; S.t -= dt; if (S.t <= 0 || !o || o.dead || (!isBeast(o) && o.mode !== 'fight')) { if (S.sp) { scene.remove(S.sp); S.sp.material.dispose(); } scars.splice(i, 1); continue; }
      const P = partsOf(o).find(p => p[0] === S.key) || partsOf(o)[0], at = partPos(o, P, _b); S.e -= dt;
      if (S.sp) { S.sp.position.copy(at); S.sp.position.y += 0.4; S.sp.material.opacity = 0.75 + Math.sin(SC.clock * 9) * 0.15; }
      else if (S.e <= 0) { S.e = S.key === 'engines' ? 0.09 : 0.16; if (S.key === 'engines') burst(at.x, at.z, Math.random() < 0.7 ? '#4a4a52' : '#ff8a3a', 1, 0.7); else burst(at.x, at.z, '#7fd0ff', 1, 0.5); } } }
  // ---------- per frame ----------
  function timeK() { if (SC.phase === 'aim') return CFG.freeze; if (SC.phase === 'run') return SC.cur && SC.cur.stage === 'stop' ? CFG.freeze : CFG.slowmo; if (SC.phase === 'kill') return 0.3; if (SC.phase === 'out') return lerp(CFG.slowmo, 1, ease(clamp(SC.t / 0.45, 0, 1))); return 1; }
  function update(rdt) { SC.clock = (SC.clock || 0) + rdt; scarTick(rdt * timeK());
    if (SC.stamp) { const S = SC.stamp; S.t += rdt; const k = clamp(S.t / 0.18, 0, 1); S.el.style.opacity = String(S.t < 1.1 ? 1 : clamp(1 - (S.t - 1.1) / 0.3, 0, 1)); S.el.style.transform = 'translate(-50%,-50%) scale(' + lerp(2.2, 1, ease(k)) + ') rotate(-4deg)'; if (S.t > 1.4) { S.el.remove(); SC.stamp = null; } }
    if (SC.phase === 'out') { SC.t += rdt; if (SC.t > 0.45) SC.phase = null; return; }
    if (!SC.on) return; SC.t += rdt;
    if (SC.phase === 'aim') { SC.scanT = (SC.scanT || 0) + rdt; if (SC.xr && SC.xrO) { const src = SC.xrO.g || SC.xrO.m; SC.xrT += rdt; src.updateMatrixWorld(true); SC.xr.matrix.copy(src.matrixWorld).multiply(_xs); SC.xr.matrixWorld.copy(SC.xr.matrix); const U = xrMat.uniforms; U.uT.value = SC.clock; U.uA.value = SC.xrT < 0.6 ? Math.sin(SC.xrT / 0.6 * Math.PI / 2) : 0.8 + Math.sin(SC.clock * 4) * 0.08; U.uBand.value = SC.scanT < 0.6 ? SC.sweepX * (((SC.cv || (SC.cv = container.querySelector('canvas'))) && SC.cv.width / Math.max(1, W())) || 1) : -1; }
      if (St.phase !== 'free') { exit(true); return; } if (!alive(SC.tgts[SC.ti])) { SC.q = SC.q.filter(s => alive(s.o)); cycle(0); if (!SC.on) return; } layoutTags(); if (((SC.t * 4) | 0) !== SC._pt) { SC._pt = (SC.t * 4) | 0; panel(); } }
    if (SC.phase === 'run') { const C = SC.cur;
      if (!C) { if (SC.shot < SC.q.length) { const s = SC.q[SC.shot]; SC.shot++; $('rt').textContent = 'SHOT ' + SC.shot + ' / ' + SC.q.length; const B = fireOne(s); SC.cur = B ? { B, s, stage: 'fly', t: 0, first: SC.shot === 1 } : { s, stage: 'hold', t: CFG.hold * 0.5 }; }   /* s578 (Ben): the FIRST shot runs twice as long, so the player sees what is happening */
        else if (SC.killO) { SC.phase = 'kill'; SC.t = 0; SC.killA = Math.atan2(SC.camP.z - SC.killO.z, SC.camP.x - SC.killO.x); $('rt').textContent = 'TARGET DOWN'; }
        else { SC.hold = (SC.hold || 0) + rdt; if (SC.hold > 0.25) { SC.hold = 0; SC.q = []; exit(false); } } }
      else { C.t += rdt;
        if (C.stage === 'fly') { const B = C.B, k = Math.min(1, C.t / (CFG.fly * (C.first ? 2 : 1))), to = tgtPos(C.s, V()); if (B.miss) to.add(B.miss); B.m.position.lerpVectors(B.from, to, k); B.m.position.y += Math.sin(k * Math.PI) * 0.8; B.m.lookAt(to); B.g.position.copy(B.m.position);
          if (k >= 1) { const r = land(B); C.res = r; C.stage = 'stop'; C.t = 0; C.stop = r.crit ? CFG.stopCrit : r.hit ? CFG.stop : 0; if (r.crit) SC.shake = 1; else if (r.hit) SC.shake = 0.35; } }
        else if (C.stage === 'stop') { if (C.t >= C.stop) { C.stage = 'hold'; C.t = 0; } }
        else if (C.stage === 'hold') { if (C.t >= (C.res && C.res.killed && SC.shot >= SC.q.length ? 0.1 : CFG.hold * (C.first ? 2 : 1))) SC.cur = null; } } }
    if (SC.phase === 'kill') { if (SC.t > CFG.kill) { SC.q = []; exit(false); } }
    for (let i = SC.fx.length - 1; i >= 0; i--) { const F = SC.fx[i]; F.t += rdt; const q = proj(_a.set(F.x, 1.5 + F.t * 2.2, F.z), {}); F.el.style.transform = 'translate(' + (q.x - (F.el.offsetWidth || 120) / 2) + 'px,' + (q.y - 30) + 'px)'; F.el.style.opacity = String(clamp(2.2 - F.t * 1.4, 0, 1)); if (F.t > 1.8) { F.el.remove(); SC.fx.splice(i, 1); } } }
  // the camera: AIM = a framed shot of the target · FLY = chasing the round · STOP / HOLD = held on the impact, easing in · KILL = a slow orbit round the wreck · then back to the map camera. Shake on hits.
  function cam(rdt) { if (!SC.on && SC.phase !== 'out') return;
    if (SC.phase === 'out') { const k = ease(clamp(SC.t / 0.45, 0, 1)); camera.position.lerpVectors(SC.camP, camera.position, k); _a.lerpVectors(SC.camL, _b.copy(camera.position).add(camera.getWorldDirection(_c).multiplyScalar(30)), k); camera.lookAt(_a); return; }
    const sp = ship(), narrow = clamp(1.25 / Math.max(0.45, W() / H()), 1, 2.3), wantP = V(), wantL = V(); let rate = 5;
    if (SC.phase === 'aim') { const o = SC.tgts[SC.ti]; if (!o) return; const dx = o.x - sp.x, dz = o.z - sp.z, d = Math.hypot(dx, dz) || 1, fx = dx / d, fz = dz / d, px = -fz, pz = fx, D = Math.max(16, halfOf(o) * 4.2) * narrow;
      const sd = SC.side || (SC.side = 1); wantP.set(o.x - fx * D * 0.3 + px * D * 0.85 * sd, D * 0.62, o.z - fz * D * 0.3 + pz * D * 0.85 * sd); wantL.set(o.x, -D * 0.06, o.z); }   // s582: framed from the side, so your own ship is not in the foreground
    else if (SC.phase === 'kill') { const o = SC.killO, R = Math.max(12, halfOf(o) * 5.5) * Math.min(1.6, narrow), a = SC.killA + SC.t * 0.75; wantP.set(o.x + Math.cos(a) * R, R * (0.5 - SC.t * 0.06), o.z + Math.sin(a) * R); wantL.set(o.x, 0, o.z); rate = 3; }
    else if (SC.cur) { const C = SC.cur, o = C.s.o, to = tgtPos(C.s, V()), L = halfOf(o);
      if (C.stage === 'fly' && C.B) { const b = C.B.m.position, f0 = C.B.from, dx = to.x - f0.x, dz = to.z - f0.z, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl, sd = SC.side || 1, D = (dl * 0.55 + 10) * Math.min(1.5, narrow);   // s582: a side-on tracking shot of the round crossing to the target (not glued behind it)
        const mx = f0.x + dx * 0.58, mz = f0.z + dz * 0.58; wantP.set(mx - uz * D * 0.8 * sd - ux * D * 0.25, D * 0.5, mz + ux * D * 0.8 * sd - uz * D * 0.25); wantL.set(lerp(b.x, to.x, 0.4), 0, lerp(b.z, to.z, 0.4)); rate = 7; }
      else { const dx = o.x - sp.x, dz = o.z - sp.z, d = Math.hypot(dx, dz) || 1, fx = dx / d, fz = dz / d, D = Math.max(9, L * 3.2) * Math.min(1.5, narrow) * (1 - Math.min(0.15, C.t * 0.4)); wantP.set(o.x - fx * D + fz * D * 0.45, D * 0.5, o.z - fz * D - fx * D * 0.45); wantL.copy(to); rate = C.stage === 'stop' ? 18 : 6; } }
    else return;
    SC.blend = Math.min(1, SC.blend + rdt / 0.45); const k = SC.blend < 1 ? ease(SC.blend) : 1 - Math.exp(-rdt * rate);
    if (SC.blend < 1) { SC.camP.lerpVectors(SC.fromP, wantP, k); SC.camL.lerpVectors(SC.fromL, wantL, k); } else { SC.camP.lerp(wantP, k); SC.camL.lerp(wantL, k); }
    camera.position.copy(SC.camP); if (SC.shake > 0.01) { const a = SC.shake * 0.6; camera.position.x += (Math.random() - 0.5) * a; camera.position.y += (Math.random() - 0.5) * a; camera.position.z += (Math.random() - 0.5) * a; SC.shake *= Math.exp(-rdt * 7); }
    camera.lookAt(SC.camL); }
  const onKey = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; const k = e.key;
    if (!SC.on) { if ((k === 'q' || k === 'Q' || k === '4') && !e.repeat && avail()) { e.preventDefault(); enter(); } return; }
    if (SC.phase !== 'aim') return; e.preventDefault(); e.stopPropagation();
    if (k === 'Escape' || k === 'q' || k === 'Q' || k === '4') exit(true); else if (k === 'ArrowLeft' || k === 'a' || k === 'A') cycle(-1); else if (k === 'ArrowRight' || k === 'd' || k === 'D') cycle(1);
    else if (k === 'Enter' || k === ' ') execute(); else if (k === 'w' || k === 'W' || k === 's' || k === 'S') { const i = WEAPONS.findIndex(w => w.k === SC.wk); pickW(WEAPONS[(i + (k === 's' || k === 'S' ? -1 : 1) + WEAPONS.length) % WEAPONS.length].k); } else if (k === 'Backspace' || k === 'Delete') clearQ(); else if (/^[1-4]$/.test(k)) { const o = SC.tgts[SC.ti], P = o && partsOf(o)[+k - 1]; if (P) queue(o, P[0]); } };
  window.addEventListener('keydown', onKey, true);
  return { get on() { return SC.on; }, get phase() { return SC.phase; }, enter, exit, toggle() { if (SC.on) { if (SC.phase === 'aim') exit(true); } else enter(); }, timeK, update, cam, avail, nearest, CFG, ZONES,
    hud() { const n = nearest(), a = avail(); return a || SC.on ? { avail: a, on: SC.on, red: n < 60, pulse: n < 40 ? 0.45 : n < 70 ? 0.75 : n < 105 ? 1.05 : 1.6, label: a ? Math.round(n) + ' M' : '' } : null; },
    destroy() { window.removeEventListener('keydown', onKey, true); ov.remove(); } };
}

