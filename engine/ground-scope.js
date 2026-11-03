// s694 THE GROUND SCOPE (Ben: "activate the SCOPE like we have it in the space map", for every battle map).
// Same idea as worlds/space-scope.js: TIME FREEZES, the camera swings onto a robot and its parts light up as called-shot zones:
//   HEAD / SENSORS (low odds, x2.6 CRITICAL + STUNNED 2 s) · GUN ARM (JAMMED 7 s, no shooting) · LEGS (SLOWED 8 s) · BODY (reliable)
// Queue up to 3 shots across robots in range (◀ ▶ cycles), each with its own weapon: LASER (called shot) · SWORD LUNGE (close range only) ·
// THROW (an item from your bag) · SUPER (the one you have ready). Each costs ENERGY. EXECUTE = slow motion, shot by shot, then time snaps back.
// Opened like space: the HUD menu circle (button 4) turns into the SCOPE and pulses when robots are near; desktop 4 or F.
// The robots are HACKED, not evil: a head hit can shake the real voice loose for a moment.
// createGroundScope(X) — X: { THREE, camera, container, foes(), player() → {x,y,z,yaw}, hb(type) → [r, y0, y1], damage(e, d, fx, fz),
//   energy() / spend(n), lunge(e), throwables() → [{id,name}], throwItem(id) → bool, superReady(), fireSuper(), say(text, x, y, z, col), sfx(k, o) }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = k => k * k * (3 - 2 * k);
export const GS_CFG = { range: 22, sweet: 7, max: 3, freeze: 0.002, slowmo: 0.18, fly: 0.55, hold: 0.55, dmg: 26 };
export const GS_ZONES = [
  { k: 'head', name: 'HEAD', what: 'STUNNED 2 S · CRITICAL', odds: 0.36, mul: 2.6, col: '#ec3013', y: 0.88, side: 0 },
  { k: 'gun', name: 'GUN ARM', what: 'JAMMED 7 S', odds: 0.58, mul: 1, col: '#38bdf8', y: 0.6, side: 1 },
  { k: 'legs', name: 'LEGS', what: 'SLOWED 8 S', odds: 0.7, mul: 1, col: '#ffd23a', y: 0.16, side: 0 },
  { k: 'body', name: 'BODY', what: 'RELIABLE', odds: 0.9, mul: 1, col: '#f3f2f2', y: 0.48, side: 0 }];
export const GS_WEAPONS = [
  { k: 'laser', name: 'LASER', short: 'CALLED SHOT', cost: 12, odds: 1, dmg: 1 },
  { k: 'lunge', name: 'SWORD LUNGE', short: 'CLOSE · x1.6', cost: 15, odds: 1.25, dmg: 1.6, reach: 5.5 },
  { k: 'throw', name: 'THROW', short: 'FROM YOUR BAG', cost: 6, odds: 0.85, dmg: 1.2 },
  { k: 'super', name: 'SUPER', short: 'YOUR READY SUPER', cost: 0, odds: 1, dmg: 0 }];
const VOICES = ['…not… my voice…', 'RUN… while I hold it…', 'who is… speaking for me…', 'free… me…'];
export function createGroundScope(X) {
  const { THREE, camera, container } = X, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), _a = V(), _b = V();
  const S = { on: false, phase: 'aim', tgt: null, zone: 'body', weap: 'laser', q: [], k: 0, t: 0, cam: { p: V(), l: V(), p0: V(), l0: V() }, bolt: null, red: false };
  const live = () => X.foes().filter(e => e.alive && e.type !== 'gate' && !e.freed);
  const dist = e => { const p = X.player(); return Math.hypot(e.x - p.x, e.z - p.z); };
  const inRange = () => live().filter(e => dist(e) < GS_CFG.range && Math.abs(e.y - X.player().y) < 4).sort((a, b) => dist(a) - dist(b));
  const zonePos = (e, z, out) => { const [r, y0, y1] = X.hb(e.type) || [0.6, 0, 1.6], p = X.player(), a = Math.atan2(p.x - e.x, p.z - e.z), sx = Math.cos(a), sz = -Math.sin(a);
    return out.set(e.x + sx * z.side * r * 0.95 + Math.sin(a) * r * 0.6, e.y + y0 + (y1 - y0) * z.y, e.z + sz * z.side * r * 0.95 + Math.cos(a) * r * 0.6); };
  const used = () => S.q.reduce((n, s) => n + (GS_WEAPONS.find(w => w.k === s.w).cost), 0);
  const oddsOf = (e, zk, wk) => { const z = GS_ZONES.find(q => q.k === zk), w = GS_WEAPONS.find(q => q.k === wk), d = dist(e); if (wk === 'super') return 1;
    const fall = d <= GS_CFG.sweet ? 1 : clamp(1 - (d - GS_CFG.sweet) / (GS_CFG.range * 1.2), 0.35, 1); return clamp(z.odds * w.odds * fall, 0.05, 0.97); };
  const weapOk = (wk, e) => { const w = GS_WEAPONS.find(q => q.k === wk); if (!e) return false; if (wk === 'lunge' && dist(e) > w.reach) return false;
    if (wk === 'throw' && !(X.throwables && X.throwables().length)) return false; if (wk === 'super' && (!X.superReady || !X.superReady() || S.q.some(s => s.w === 'super'))) return false;
    return X.energy() - used() >= w.cost; };
  // ---------- DOM (inverted Modernist: dark ground, light ink, red accent, Archivo, 2px rules, no rounded corners) ----------
  const root = document.createElement('div'); root.style.cssText = 'position:absolute;inset:0;z-index:40;display:none;pointer-events:none;font-family:Archivo,sans-serif;color:#f3f2f2';
  root.innerHTML = '<div data-v style="position:absolute;inset:0;background:radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 0, rgba(0,0,0,0) 34%, rgba(10,8,8,0.55) 70%);pointer-events:none"></div>'
    + '<div data-top style="position:absolute;left:0;right:0;top:0;display:flex;flex-wrap:wrap;align-items:stretch;background:#201e1d;border-bottom:2px solid #f3f2f2;pointer-events:auto"></div>'
    + '<div data-tags style="position:absolute;inset:0;pointer-events:none"></div>'
    + '<div data-bot style="position:absolute;left:0;right:0;bottom:0;background:#201e1d;border-top:2px solid #f3f2f2;pointer-events:auto"></div>'
    + '<div data-msg style="position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);pointer-events:none"></div>';
  (container || document.body).appendChild(root);
  const $ = s => root.querySelector('[data-' + s + ']');
  const btn = (label, sub, on, ok, fn, extra = '') => { const b = document.createElement('button'); b.style.cssText = 'min-height:48px;padding:6px 12px;text-align:left;font:800 14px Archivo,sans-serif;letter-spacing:0.03em;border:0;border-right:2px solid #f3f2f2;border-bottom:2px solid #f3f2f2;margin:0 -2px -2px 0;cursor:' + (ok ? 'pointer' : 'default') + ';background:' + (on ? '#f3f2f2' : 'transparent') + ';color:' + (on ? '#201e1d' : '#f3f2f2') + ';opacity:' + (ok ? 1 : 0.4) + ';' + extra;
    b.innerHTML = label + (sub ? '<span style="display:block;font:600 11px Archivo,sans-serif;letter-spacing:0.04em;color:' + (on ? '#5c1a0e' : '#c9c6c4') + '">' + sub + '</span>' : ''); if (ok) b.onclick = e => { e.stopPropagation(); fn(); draw(); }; return b; };
  function draw() { const top = $('top'), bot = $('bot'); top.innerHTML = ''; bot.innerHTML = ''; if (!S.on) return;
    const e = S.tgt, en = Math.round(X.energy() - used()), all = inRange(), ix = all.indexOf(e);
    const title = document.createElement('div'); title.style.cssText = 'flex:1 1 200px;padding:8px 14px;display:flex;flex-direction:column;justify-content:center;border-right:2px solid #f3f2f2';
    title.innerHTML = '<span style="font:800 12px Archivo,sans-serif;letter-spacing:0.14em;color:#ec3013">SCOPE · TIME FROZEN</span><span style="font:800 16px Archivo,sans-serif">' + (e ? (e.name || String(e.type).toUpperCase()) + ' · ' + Math.round(dist(e)) + ' M' : 'NO TARGET') + '</span>';
    top.appendChild(title);
    const meta = document.createElement('div'); meta.style.cssText = 'padding:8px 14px;display:flex;flex-direction:column;justify-content:center;border-right:2px solid #f3f2f2;min-width:110px';
    meta.innerHTML = '<span style="font:700 11px Archivo,sans-serif;letter-spacing:0.1em;color:#c9c6c4">ENERGY</span><span style="font:800 16px Archivo,sans-serif">' + en + '</span>'; top.appendChild(meta);
    if (S.phase === 'aim') { top.appendChild(btn('◀', '', false, all.length > 1, () => cycle(-1), 'min-width:52px;border-bottom:0')); top.appendChild(btn('▶', '', false, all.length > 1, () => cycle(1), 'min-width:52px;border-bottom:0')); top.appendChild(btn('EXIT', 'ESC', false, true, () => exit(), 'min-width:72px;border-bottom:0;border-right:0')); }
    if (S.phase !== 'aim') return;
    const rail = document.createElement('div'); rail.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));border-bottom:2px solid #f3f2f2';
    for (const w of GS_WEAPONS) rail.appendChild(btn(w.name, w.short + (w.cost ? ' · ' + w.cost + ' EN' : ''), S.weap === w.k, weapOk(w.k, e) || S.weap === w.k, () => { S.weap = w.k; }));
    bot.appendChild(rail);
    const row = document.createElement('div'); row.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) auto auto';
    const ql = document.createElement('div'); ql.style.cssText = 'padding:8px 14px;font:700 13px Archivo,sans-serif;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;border-right:2px solid #f3f2f2';
    ql.innerHTML = '<span style="color:#c9c6c4;letter-spacing:0.1em;font-size:11px">QUEUE ' + S.q.length + ' / ' + GS_CFG.max + '</span>' + (S.q.length ? S.q.map((s, i) => '<span>' + (i + 1) + '. ' + GS_WEAPONS.find(w => w.k === s.w).name + (s.w === 'super' ? '' : ' → ' + GS_ZONES.find(z => z.k === s.z).name) + ' ' + Math.round(s.o * 100) + '%</span>').join('') : '<span style="color:#c9c6c4">TAP A PART OF THE ROBOT</span>');
    row.appendChild(ql);
    row.appendChild(btn('UNDO', '', false, S.q.length > 0, () => { S.q.pop(); }, 'min-width:80px;border-bottom:0'));
    row.appendChild(btn('EXECUTE', S.q.length ? 'FIRE ' + S.q.length : '', false, S.q.length > 0, () => execute(), 'min-width:120px;border-bottom:0;border-right:0;background:' + (S.q.length ? '#ec3013' : 'transparent')));
    bot.appendChild(row); }
  const tags = []; function buildTags() { const box = $('tags'); box.innerHTML = ''; tags.length = 0; if (!S.on || S.phase !== 'aim' || !S.tgt) return;
    if (S.weap === 'super') { const t = document.createElement('button'); t.style.cssText = 'position:absolute;left:0;top:0;pointer-events:auto;min-height:48px;padding:6px 14px;font:800 15px Archivo,sans-serif;background:#201e1d;color:#f3f2f2;border:2px solid #ec3013;cursor:pointer;text-align:left'; t.innerHTML = 'QUEUE THE SUPER<span style="display:block;font:600 11px Archivo,sans-serif;color:#c9c6c4">AT THIS ROBOT</span>'; t.onclick = ev => { ev.stopPropagation(); add('body'); }; box.appendChild(t); tags.push({ el: t, z: GS_ZONES[3] }); return; }
    for (const z of GS_ZONES) { const o = oddsOf(S.tgt, z.k, S.weap), ok = weapOk(S.weap, S.tgt) && S.q.length < GS_CFG.max; const t = document.createElement('button');
      t.style.cssText = 'position:absolute;left:0;top:0;pointer-events:auto;min-height:44px;min-width:44px;padding:5px 10px 5px 12px;text-align:left;font:800 13px Archivo,sans-serif;background:#201e1d;color:#f3f2f2;border:2px solid ' + z.col + ';cursor:' + (ok ? 'pointer' : 'default') + ';opacity:' + (ok ? 1 : 0.5) + ';white-space:nowrap';
      t.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:' + z.col + ';margin-right:6px"></span>' + (z.k === 'legs' && S.tgt.type === 'drone' ? 'ROTORS' : z.name) + ' <b style="color:' + z.col + '">' + Math.round(o * 100) + '%</b><span style="display:block;font:600 10px Archivo,sans-serif;letter-spacing:0.05em;color:#c9c6c4">' + z.what + '</span>';
      if (ok) t.onclick = ev => { ev.stopPropagation(); add(z.k); }; box.appendChild(t); tags.push({ el: t, z }); } }
  function placeTags() { if (!tags.length || !S.tgt) return; const host = (container || document.body).getBoundingClientRect(), W = host.width, H = host.height;
    const yTop = $('top').getBoundingClientRect().bottom - host.top + 6, yBot = $('bot').getBoundingClientRect().top - host.top - 6, P = [];
    for (const T of tags) { zonePos(S.tgt, T.z, _a); _a.project(camera); P.push({ T, x: (_a.x + 1) / 2 * W, y: (1 - _a.y) / 2 * H, w: T.el.offsetWidth || 120, h: T.el.offsetHeight || 44 }); }
    /* s694b no overlaps: sort by height on screen, push each tag below the one above it, then shift the stack up if it runs into the weapon rail */
    P.sort((p, q) => p.y - q.y); let y = -1e9; for (const p of P) { p.ly = Math.max(p.y - p.h / 2, y + 4, yTop); y = p.ly + p.h; }
    const over = y - yBot; if (over > 0) for (const p of P) p.ly = Math.max(yTop, p.ly - over);
    const cx = P.reduce((s, p) => s + p.x, 0) / P.length, right = cx < W * 0.62;
    for (const p of P) { const lx = clamp(right ? Math.max(cx, p.x) + 26 : Math.min(cx, p.x) - 26 - p.w, 6, W - p.w - 6); p.T.el.style.transform = 'translate(' + Math.round(lx) + 'px,' + Math.round(p.ly) + 'px)'; } }
  function add(zk) { const e = S.tgt; if (!e || S.q.length >= GS_CFG.max || !weapOk(S.weap, e)) return; S.q.push({ e, z: zk, w: S.weap, o: oddsOf(e, zk, S.weap) }); X.sfx && X.sfx('scopeTag'); if (S.weap === 'super' || S.weap === 'throw' && !(X.throwables().length > 1)) S.weap = 'laser'; buildTags(); draw(); }
  function cycle(d) { const all = inRange(); if (!all.length) return; const i = all.indexOf(S.tgt); S.tgt = all[(i + d + all.length) % all.length]; frameOn(S.tgt); buildTags(); }
  function frameOn(e) { const p = X.player(); S.cam.p0.copy(S.cam.p); S.cam.l0.copy(S.cam.l); const a = Math.atan2(e.x - p.x, e.z - p.z), [r, y0, y1] = X.hb(e.type) || [0.6, 0, 1.6], h = y1 - y0, d = Math.max(3.2, h * 2.2 + r * 2);
    S.cam.tp = V(e.x - Math.sin(a) * d + Math.cos(a) * d * 0.45, e.y + y0 + h * 0.75 + 0.6, e.z - Math.cos(a) * d - Math.sin(a) * d * 0.45); S.cam.tl = V(e.x, e.y + y0 + h * 0.5, e.z); S.cam.k = 0; }
  function enter() { if (S.on) return false; const all = inRange(); if (!all.length) { X.say && (() => { const p = X.player(); X.say('NO ROBOTS IN RANGE', p.x, p.y + 3, p.z, '#ffd23a'); })(); return false; }
    if (X.energy() < 6) { const p = X.player(); X.say && X.say('NEED ENERGY', p.x, p.y + 3, p.z, '#7df9ff'); return false; }
    S.on = true; S.phase = 'aim'; S.q = []; S.weap = 'laser'; S.tgt = all[0]; camera.updateMatrixWorld(); S.cam.p.copy(camera.position); camera.getWorldDirection(_b); S.cam.l.copy(camera.position).addScaledVector(_b, 6); frameOn(S.tgt);
    root.style.display = 'block'; X.sfx && X.sfx('scopeIn'); try { if (!localStorage.getItem('groundScope.hint.v1')) { msg('TAP A PART · PICK A WEAPON · EXECUTE', '#ffd23a', 2.4); localStorage.setItem('groundScope.hint.v1', '1'); } } catch (er) {}
    buildTags(); draw(); return true; }
  function exit() { if (S.on && X.sfx) X.sfx('scopeOut'); S.on = false; S.phase = 'aim'; S.q = []; root.style.display = 'none'; $('tags').innerHTML = ''; tags.length = 0; if (S.bolt) { S.bolt.parent && S.bolt.parent.remove(S.bolt); S.bolt = null; } if (X.onExit) X.onExit(); }
  let msgT = 0; function msg(text, col, t = 1.1) { $('msg').innerHTML = '<div style="background:#201e1d;border:2px solid ' + col + ';padding:10px 16px;font:900 20px Archivo,sans-serif;letter-spacing:0.04em;color:' + col + ';white-space:nowrap">' + text + '</div>'; msgT = t; }
  function execute() { if (!S.q.length) return; S.phase = 'fire'; S.k = 0; S.t = 0; $('tags').innerHTML = ''; tags.length = 0; draw(); startShot(); }
  function startShot() { const s = S.q[S.k]; if (!s) { S.phase = 'done'; S.t = 0; return; } S.t = 0; s.hit = Math.random() < s.o; s.done = false; const w = GS_WEAPONS.find(q => q.k === s.w);
    if (w.cost) X.spend(w.cost); if (s.w === 'throw') { const it = X.throwables()[0]; s.item = it ? it.name : 'ITEM'; if (!it || !X.throwItem(it.id)) s.hit = false; }
    if (s.e.alive) frameOn(s.e); }
  function resolve(s) { const e = s.e; if (!e.alive) return; const z = GS_ZONES.find(q => q.k === s.z), w = GS_WEAPONS.find(q => q.k === s.w);
    if (s.w === 'super') { X.fireSuper && X.fireSuper(e); msg('SUPER!', '#ffd23a'); return; }
    if (s.w === 'lunge' && X.lunge) X.lunge(e);
    if (!s.hit) { msg('MISS', '#c9c6c4'); X.sfx && X.sfx('botBlock', { p: 1.4, v: 0.4 }); return; }
    const p = X.player(); X.damage(e, GS_CFG.dmg * z.mul * w.dmg, e.x - p.x, e.z - p.z);
    if (z.k === 'head') { e.stunT = Math.max(e.stunT || 0, 2); msg('CRITICAL · STUNNED', '#ec3013', 1.3); if (e.alive && X.say && Math.random() < 0.6) { X.say(VOICES[(Math.random() * VOICES.length) | 0], e.x, e.y + 3, e.z, '#7df9ff'); X.sfx && X.sfx('glitch'); } }
    else if (z.k === 'gun') { e.jamT = Math.max(e.jamT || 0, 7); msg('GUN JAMMED', '#38bdf8'); }
    else if (z.k === 'legs') { e.slowT = Math.max(e.slowT || 0, 8); msg('SLOWED', '#ffd23a'); }
    else msg('HIT', '#f3f2f2'); }
  function bolt(s, k) { const p = X.player(); if (!S.bolt) { S.bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.bolt.renderOrder = 20; (X.scene || camera.parent || null)?.add(S.bolt); }
    const z = GS_ZONES.find(q => q.k === s.z); zonePos(s.e, z, _a); if (!s.hit) _a.x += 1.4 * (s.k2 || (s.k2 = Math.random() < 0.5 ? -1 : 1)), _a.y += 0.6; _b.set(p.x, p.y + 1.3, p.z); const end = _b.clone().lerp(_a, ease(k));
    S.bolt.material.color.set(s.w === 'throw' ? 0xf3f2f2 : s.w === 'lunge' ? 0x7df9ff : 0xffd23a); const mid = _b.clone().add(end).multiplyScalar(0.5), L = Math.max(0.01, _b.distanceTo(end));
    S.bolt.position.copy(mid); S.bolt.scale.set(1, L, 1); S.bolt.quaternion.setFromUnitVectors(V(0, 1, 0), end.clone().sub(_b).normalize()); S.bolt.visible = k < 1 && s.w !== 'super'; }
  // real dt in; returns the world time scale (freeze while aiming, slow motion while the shots fly)
  function update(dt) { if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('msg').innerHTML = ''; }
    const c = S.cam; if (c.tp) { c.k = Math.min(1, (c.k || 0) + dt / 0.45); const q = ease(c.k); c.p.copy(c.p0).lerp(c.tp, q); c.l.copy(c.l0).lerp(c.tl, q); }
    if (!S.on) return 1;
    if (S.phase === 'aim') { if (!S.tgt || !S.tgt.alive) { const all = inRange(); if (!all.length) { exit(); return 1; } S.tgt = all[0]; frameOn(S.tgt); buildTags(); } placeTags(); return GS_CFG.freeze; }
    if (S.phase === 'fire') { const s = S.q[S.k]; S.t += dt; const k = Math.min(1, S.t / GS_CFG.fly); if (s.e.alive || s.done) bolt(s, k); if (k >= 1 && !s.done) { s.done = true; resolve(s); if (S.bolt) S.bolt.visible = false; }
      if (S.t >= GS_CFG.fly + GS_CFG.hold) { S.k++; startShot(); } draw(); return GS_CFG.slowmo; }
    if (S.phase === 'done') { S.t += dt; if (S.t > 0.35) exit(); return 0.5; } return 1; }
  function cam(camera2) { if (!S.on && !(S.cam.k < 1)) return; camera2.position.copy(S.cam.p); camera2.lookAt(S.cam.l); }
  const onKey = e => { if (e.repeat || /INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return; if (S.on) { if (e.code === 'Escape') { exit(); e.preventDefault(); } else if (e.code === 'Enter' && S.phase === 'aim') { execute(); e.preventDefault(); } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') cycle(-1); else if (e.code === 'ArrowRight' || e.code === 'KeyD') cycle(1); else if (e.code === 'Digit4' || e.code === 'KeyF') { if (S.phase === 'aim') exit(); } return; }
    if ((e.code === 'Digit4' || e.code === 'KeyF') && (!X.canOpen || X.canOpen())) { if (enter()) e.preventDefault(); } };
  addEventListener('keydown', onKey, true);
  return { get on() { return S.on; }, get phase() { return S.phase; }, enter, exit, toggle() { if (S.on) { if (S.phase === 'aim') exit(); } else enter(); }, update, cam,
    avail: () => !S.on && inRange().length > 0 && X.energy() >= 6, debug: () => live().map(e => [e.type, Math.round(dist(e)), +(+e.y).toFixed(1)]), red: () => inRange().some(e => dist(e) < 9), dispose() { removeEventListener('keydown', onKey, true); root.remove(); } };
}
