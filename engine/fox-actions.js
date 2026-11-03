// s343 FOX ACTIONS (Ben): the ACTIONS button. TAP = the special action here (TALK etc.) or the PINNED action · HOLD = the game PAUSES and a grid of the actions that work RIGHT NOW opens (tap one = do it, PIN = make it the tap action).
// Inverted Modernist menu (dark ground, light ink, 2 px rules, no rounding). Also owns the HACK minigame (stop the bar in the green 3 times) and the SCAN detective view overlay.
//   const A = foxActions({ available: () => ['scan', ...], onDo: id => {...} })   map: dt *= A.timeScale() · A.scanDraw(pts) while scanning · A.hack(ok => …)
const INK = '#201e1d', BG = '#f3f2f2', RULE = '#3a3836', SUB = '#bdb8b3', RED = '#ec3013', BLUE = '#1f8bff', F = 'Archivo,system-ui,sans-serif';
export const ACTIONS = [
  ['scan', 'SCAN', 'The world goes dark, everything you can use glows', 'M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4M7 12h10'],
  ['stealth', 'STEALTH', 'Crouch-walk: slower, quieter, robots see you from closer', 'M2 12s3.5-7 10-7c2 0 3.7.6 5.1 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.1-1.5M3 3l18 18'],
  ['steal', 'STEAL', 'Take from someone without them seeing. Get caught and they chase you', 'M12 2v6M8 5l4 3 4-3M5 10h14l-1.5 11h-11z'],
  ['hack', 'HACK', 'Break the hack on this robot and set it free', 'M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16'],
  ['team', 'CALL HOPE / NOBLE', 'Whistle your team to you, or tell them to wait', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'],
  ['photo', 'PHOTO MODE', 'Hide the HUD and freeze the moment', 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  ['marker', 'PLACE MARKER', 'Pin this spot so you can find it again', 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  ['emote', 'WAVE', 'Say hello. Foxes nearby react', 'M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0'],
  ['rest', 'SIT / REST', 'Sit down and slowly heal. Moving stands you up', 'M4 18v3M20 18v3M4 14h16v4H4zM6 14V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6'],
  ['throw', 'THROW', 'Throw a stone. Robots near where it lands go and look', 'M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM15 7l4-4M19 3h-4M19 3v4'],
  ['climb', 'CLIMB / GRAB', 'Grab the ledge or rope in front of you', 'M7 21V3M17 21V3M7 7h10M7 12h10M7 17h10'],
  ['ship', 'CALL SHIP', 'Bring your ship down to the dock', 'M12 2l3 7h5l-4 4 2 7-6-4-6 4 2-7-4-4h5z'],
  ['search', 'SEARCH', 'Look around for hidden things nearby', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3'],
  ['track', 'TRACK QUEST', 'Point the way to your next step', 'M3 11l19-9-9 19-2-8z']].map(([id, name, desc, d]) => ({ id, name, desc, d }));
const svg = (d, c, s = 22) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="' + c + '" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter" style="display:block;flex:none"><path d="' + d + '"></path></svg>';
const LS = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const mk = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
let ui = null;
function mkUI() { if (ui) return ui; const d = document;
  const ov = mk('div', 'position:fixed;inset:0;z-index:62;display:none;background:rgba(0,0,0,.55);font-family:' + F);
  const pn = mk('div', 'position:absolute;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));bottom:max(10px,env(safe-area-inset-bottom));max-width:820px;margin:0 auto;display:flex;flex-direction:column;background:' + INK + ';border:2px solid ' + BG + ';color:' + BG);
  const hd = mk('div', 'flex:none;display:flex;align-items:stretch;border-bottom:2px solid ' + BG);
  const ht = mk('div', 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding:12px 14px', '<div style="font:900 16px ' + F + ';letter-spacing:.08em">ACTIONS</div><div data-sub style="font:600 11px ' + F + ';letter-spacing:.04em;color:' + SUB + '"></div>');
  const x = mk('button', 'flex:none;width:56px;min-height:48px;border:0;border-left:2px solid ' + BG + ';border-radius:0;background:' + INK + ';color:' + BG + ';font:900 18px ' + F + ';cursor:pointer'); x.textContent = '✕'; x.setAttribute('aria-label', 'Close');
  hd.append(ht, x);
  const sc = mk('div', 'flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch');
  const gr = mk('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))'); sc.appendChild(gr); pn.append(hd, sc); ov.appendChild(pn);
  // HACK minigame
  const hk = mk('div', 'position:fixed;inset:0;z-index:63;display:none;background:rgba(0,0,0,.6);font-family:' + F + ';touch-action:none;user-select:none;-webkit-user-select:none');
  const hp = mk('div', 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100% - 24px));background:' + INK + ';border:2px solid ' + BG + ';color:' + BG + ';display:flex;flex-direction:column');
  const hh = mk('div', 'padding:12px 14px;border-bottom:2px solid ' + BG + ';display:flex;flex-direction:column;gap:4px', '<div style="font:900 16px ' + F + ';letter-spacing:.08em">HACK</div><div data-msg style="font:600 12px ' + F + ';line-height:1.35;color:' + SUB + '"></div>');
  const trk = mk('div', 'position:relative;height:44px;margin:16px 14px 10px;background:#000;border:2px solid ' + BG);
  const zone = mk('div', 'position:absolute;top:0;bottom:0;background:#39e070'); const nd = mk('div', 'position:absolute;top:-6px;bottom:-6px;width:4px;margin-left:-2px;background:' + BG);
  trk.append(zone, nd);
  const pips = mk('div', 'display:flex;gap:8px;padding:0 14px 14px');
  const go = mk('button', 'min-height:60px;border:0;border-top:2px solid ' + BG + ';border-radius:0;background:' + RED + ';color:#fff;font:900 18px ' + F + ';letter-spacing:.08em;text-align:left;padding:0 16px;cursor:pointer;touch-action:manipulation'); go.textContent = 'STOP';
  hp.append(hh, trk, pips, go); hk.appendChild(hp);
  // SCAN overlay
  const sv = mk('div', 'position:fixed;inset:0;z-index:30;display:none;pointer-events:none;background:radial-gradient(ellipse at 50% 55%, rgba(4,10,22,.35), rgba(4,10,22,.82))');
  const pinFl = mk('div', 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 120px);transform:translateX(-50%);z-index:64;display:none;padding:10px 14px;background:' + INK + ';border:2px solid ' + BG + ';color:' + BG + ';font:900 12px ' + F + ';letter-spacing:.08em;pointer-events:none;white-space:nowrap');
  const photo = mk('div', 'position:fixed;inset:0;z-index:61;display:none;cursor:pointer', '<div style="position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateX(-50%);padding:10px 14px;background:' + INK + ';border:2px solid ' + BG + ';color:' + BG + ';font:800 12px ' + F + ';letter-spacing:.06em;white-space:nowrap">PHOTO MODE · TAP TO RETURN</div>');
  const css = mk('style'); css.textContent = 'html[data-fox-photo] [data-hud-host],html[data-fox-photo] [aria-label^="Super move"]{opacity:0!important;pointer-events:none!important}@keyframes foxScan{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.18)}}';
  d.head.appendChild(css); d.body.append(sv, ov, hk, pinFl, photo);
  ui = { ov, gr, x, sub: ht.querySelector('[data-sub]'), hk, msg: hh.querySelector('[data-msg]'), zone, nd, pips, go, sv, pinFl, photo }; return ui; }
export function foxActions(o = {}) {
  const U = mkUI(), S = { open: false, hack: null, photo: false, pin: LS('fox.actions.pin', null), flash: 0 };
  const av = () => { try { return (o.available ? o.available() : []) || []; } catch (e) { return []; } };
  const def = id => ACTIONS.find(a => a.id === id);
  const flash = t => { U.pinFl.textContent = t; U.pinFl.style.display = 'block'; clearTimeout(S.ft); S.ft = setTimeout(() => { U.pinFl.style.display = 'none'; }, 1400); };
  const doIt = id => { api.close(); setTimeout(() => { try { o.onDo && o.onDo(id); } catch (e) { console.warn('action', id, e); } }, 0); };
  const grid = () => { const L = av(); U.gr.innerHTML = ''; U.sub.textContent = L.length ? 'GAME PAUSED · TAP TO USE · PIN = THE ACTIONS TAP' : 'NOTHING TO DO HERE RIGHT NOW';
    for (const id of L) { const a = def(id); if (!a) continue; const pinned = S.pin === id;
      const t = mk('div', 'display:flex;align-items:stretch;min-height:88px;border-right:2px solid ' + RULE + ';border-bottom:2px solid ' + RULE + ';background:' + INK + ';color:' + BG);
      const b = mk('div', 'flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;padding:10px 10px 10px 12px;cursor:pointer', svg(a.d, BG, 20) + '<div style="font:900 12px ' + F + ';letter-spacing:.05em;line-height:1.15">' + a.name + '</div><div style="font:600 10.5px ' + F + ';line-height:1.3;color:' + SUB + '">' + a.desc + '</div>');
      b.setAttribute('role', 'button'); b.onpointerenter = () => { b.style.background = '#4a1c14'; }; b.onpointerleave = () => { b.style.background = ''; }; b.onclick = e => { e.stopPropagation(); doIt(id); };
      const p = mk('button', 'flex:none;width:44px;border:0;border-left:2px solid ' + RULE + ';border-radius:0;background:' + (pinned ? BG : INK) + ';color:' + (pinned ? INK : SUB) + ';font:900 9px ' + F + ';letter-spacing:.06em;cursor:pointer;writing-mode:vertical-rl;transform:rotate(180deg)'); p.textContent = pinned ? 'PINNED' : 'PIN';
      p.setAttribute('aria-label', (pinned ? 'Unpin ' : 'Pin ') + a.name); p.onclick = e => { e.stopPropagation(); S.pin = pinned ? null : id; try { localStorage.setItem('fox.actions.pin', JSON.stringify(S.pin)); } catch (er) {} grid(); };
      t.append(b, p); U.gr.appendChild(t); } };
  U.x.onclick = () => api.close(); U.ov.onclick = e => { if (e.target === U.ov) api.close(); };
  U.photo.onclick = () => api.photoOff();
  const api = {
    ACTIONS, get isOpen() { return S.open; }, get busy() { return S.open || !!S.hack || S.photo; },
    get pinned() { const id = S.pin; return id && av().includes(id) ? def(id) : null; },
    timeScale() { return S.open || S.hack || S.photo ? 0 : 1; },
    open() { if (S.open) return; S.open = true; grid(); U.ov.style.display = 'block'; },
    close() { if (!S.open) return; S.open = false; U.ov.style.display = 'none'; },
    // TAP on the ACTIONS button with no special action near: the pinned action if it works here, else the grid
    tap() { const p = api.pinned; if (p) doIt(p.id); else { if (S.pin && def(S.pin)) flash(def(S.pin).name + ' · NOT HERE'); api.open(); } },
    flash,
    photoOn() { S.photo = true; document.documentElement.setAttribute('data-fox-photo', '1'); U.photo.style.display = 'block'; },
    photoOff() { S.photo = false; document.documentElement.removeAttribute('data-fox-photo'); U.photo.style.display = 'none'; },
    // HACK: stop the moving bar inside the green zone 3 times (2 misses = fail). cb(true | false)
    hack(cb, msg) { if (S.hack) return; const H = S.hack = { hits: 0, miss: 0, t: 0, sp: 0.9, z0: 0, zw: 0.22, cb, raf: 0 };
      const newZone = () => { H.zw = 0.22 - H.hits * 0.04; H.z0 = 0.08 + Math.random() * (0.84 - H.zw); U.zone.style.left = H.z0 * 100 + '%'; U.zone.style.width = H.zw * 100 + '%'; };
      const drawPips = () => { U.pips.innerHTML = ''; for (let i = 0; i < 3; i++) U.pips.appendChild(mk('div', 'flex:1;height:8px;background:' + (i < H.hits ? '#39e070' : RULE))); };
      U.msg.textContent = msg || 'The robot is running a code that isn\'t its own. Stop the bar in the green 3 times to break it.'; newZone(); drawPips(); U.hk.style.display = 'block';
      let last = performance.now(); const loop = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; H.t += dt * H.sp * (1 + H.hits * 0.35); const p = 1 - Math.abs((H.t % 2) - 1); H.p = p; U.nd.style.left = p * 100 + '%'; H.raf = requestAnimationFrame(loop); }; H.raf = requestAnimationFrame(loop);
      const end = ok => { cancelAnimationFrame(H.raf); U.hk.style.display = 'none'; S.hack = null; U.go.onclick = null; try { cb && cb(ok); } catch (e) {} };
      U.go.onclick = e => { e.stopPropagation(); const inZ = H.p >= H.z0 && H.p <= H.z0 + H.zw; if (inZ) { H.hits++; U.zone.style.background = BG; setTimeout(() => { U.zone.style.background = '#39e070'; }, 90); drawPips(); if (H.hits >= 3) return end(true); newZone(); } else { H.miss++; U.zone.style.background = RED; setTimeout(() => { U.zone.style.background = '#39e070'; }, 160); if (H.miss >= 2) return end(false); U.msg.textContent = 'Missed. One more miss and the hack locks you out.'; } }; },
    // SCAN overlay: pts = [{ x, y (0..100 % of the screen), c colour, t label }]
    scanDraw(pts) { const sv = U.sv; if (!pts) { sv.style.display = 'none'; return; } sv.style.display = 'block'; while (sv.children.length < pts.length) sv.appendChild(mk('div', 'position:absolute;display:flex;flex-direction:column;align-items:center;gap:4px;transform:translate(-50%,-50%)'));
      [...sv.children].forEach((el, i) => { const p = pts[i]; if (!p) { el.style.display = 'none'; return; } el.style.display = 'flex'; el.style.left = p.x + '%'; el.style.top = p.y + '%';
        const k = p.c + '|' + p.t; if (el._k !== k) { el._k = k; el.innerHTML = '<div style="width:30px;height:30px;border-radius:50%;border:3px solid ' + p.c + ';box-shadow:0 0 14px 4px ' + p.c + ';animation:foxScan 1.1s ease-in-out infinite;position:relative;left:50%;top:50%"></div><div style="margin-top:10px;padding:2px 5px;background:#000;color:' + p.c + ';font:900 10px ' + F + ';letter-spacing:.06em;white-space:nowrap">' + p.t + '</div>'; } }); },
    destroy() { api.close(); api.photoOff(); api.scanDraw(null); if (S.hack) { cancelAnimationFrame(S.hack.raf); U.hk.style.display = 'none'; S.hack = null; } },
  };
  window.__foxActions = api; return api;
}
