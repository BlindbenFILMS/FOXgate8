// s341 FOX SUPERS v2 (Ben): ONE SUPER BAR = the button. TAP = fire the picked super · HOLD (0.35 s) = the game PAUSES and a grid of every super opens, tap one to pick it.
// One SHARED cooldown: after a super the bar refills over that super's time (small 8 s · big 20 s · 8-Gate Burst 45 s). No meter, no stick combo.
// Desktop: Q (tap = use · hold = pick). Unlocks: the lab (practice) has all 22; the game starts with WHIRLWIND + FOX BEAM, more via unlock(key) (saved in localStorage fighter.super.unlocked).
//   const SUP = fighterSuper({ visible: () => bool, onFire: mv => {...}, practice })   map: SUP.update(realDt) · dt *= SUP.timeScale() (0 while the grid is open) · SUP.tap() fires from code
import { SFX } from './fighter-sfx.js?v=s695c';
const SM = 8, BG = 20;
export const SUPERS = [
  ['whirl', 'WHIRLWIND KICK', '01', SM, 'wind', 3.8, 4], ['beam', 'FOX BEAM', '02', SM, 'aim', 20, 5], ['chain', 'CHAIN LIGHTNING', '03', SM, 'zap', 8, 3], ['rising', 'RISING FANG', '04', SM, 'up', 3, 3.5],
  ['dash', 'BLUR DASH', '05', SM, 'dash', 4, 3], ['nova', 'NOVA RING', '06', BG, 'dot', 5, 4], ['meteor', 'METEOR DROP', '07', BG, 'down', 4, 5], ['skyrain', 'SKY RAIN', '08', BG, 'rain', 6, 4],
  ['cyclone', 'TAIL CYCLONE', '09', BG, 'wind', 4, 4], ['seekers', 'FOXFIRE SEEKERS', '10', SM, 'aim', 8, 3], ['wave', 'GROUND WAVE', '11', SM, 'waves', 7, 3.5], ['reboot', 'REBOOT PULSE', '12', BG, 'reboot', 6, 2],
  ['dome', '8-CREST DOME', '13', BG, 'shield', 3, 0], ['decoy', 'DECOY FOX', '14', BG, 'copy', 0, 0], ['burst', '8-GATE BURST', '15', 45, 'eight', 4, 8], ['shadow', 'SHADOW STEP', '16', SM, 'moon', 5, 4],
  ['tether', 'WHIP TETHER', '17', SM, 'link', 5, 2.5], ['frost', 'FROST NOVA', '18', BG, 'snow', 4.2, 3], ['gravity', 'GRAVITY WELL', '19', BG, 'orbit', 4, 3], ['heal', 'HEALING LIGHT', '20', BG, 'heart', 0, 0],
  ['mirror', 'MIRROR SHOT', '21', SM, 'aim', 9, 3], ['firetrail', 'FIRE TRAIL', '22', SM, 'flame', 4, 3]].map(([key, name, num, cd, icon, reach, k]) => ({ key, name, num, cd, icon, reach, k }));
const START = ['whirl', 'beam'], HOLD = 0.35, BLUE = '#1f8bff', INK = '#000', RULE = '#3a3836', SUB = '#8a847e';
const IC = {   // Lucide-style strokes, 24 box
  wind: 'M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2', aim: 'M12 2v4M12 18v4M2 12h4M18 12h4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', zap: 'M13 2 3 14h9l-1 8 10-12h-9z',
  up: 'M12 20V4M5 11l7-7 7 7', down: 'M12 4v16M5 13l7 7 7-7', dash: 'M5 17l5-5-5-5M13 17l5-5-5-5', dot: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  rain: 'M6 3v8M12 6v8M18 3v8M4 21h16', waves: 'M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2', reboot: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', copy: 'M9 9h12v12H9zM5 15H3V3h12v2', moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7', snow: 'M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1L19.1 4.9',
  orbit: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 12a9 9 0 0 1 9-9M21 12a9 9 0 0 1-9 9', heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3 0 1.4 1.1 2.5 2.5 2.5z' };
const icon = (k, c = '#fff', s = 22) => k === 'eight' ? '<span style="font:900 ' + (s + 2) + 'px Archivo,system-ui,sans-serif;line-height:1;color:' + c + '">8</span>'
  : '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="' + c + '" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter" style="display:block"><path d="' + IC[k] + '"></path></svg>';
const LS = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const SV = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
let ui = null;
function mkUI() { if (ui) return ui; const d = document, F = 'Archivo,system-ui,sans-serif';
  const bar = d.createElement('div'); bar.setAttribute('role', 'button'); bar.setAttribute('aria-label', 'Super move: tap to use, hold to change');
  bar.style.cssText = 'position:fixed;right:max(14px,env(safe-area-inset-right));bottom:calc(env(safe-area-inset-bottom,0px) + 212px);z-index:40;width:196px;height:46px;display:none;align-items:stretch;background:' + INK + ';border-top:2px solid ' + BLUE + ';color:#fff;font-family:' + F + ';cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .08s';
  const ic = d.createElement('div'); ic.style.cssText = 'flex:0 0 44px;display:flex;align-items:center;justify-content:center;border-right:2px solid ' + RULE + ';transition:background .15s';
  const tx = d.createElement('div'); tx.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:3px;padding:0 10px';
  const lab = d.createElement('div'); lab.style.cssText = 'font:800 9px ' + F + ';letter-spacing:.08em;line-height:1;color:' + SUB + ';white-space:nowrap;overflow:hidden';
  const nm = d.createElement('div'); nm.style.cssText = 'font:900 12px ' + F + ';letter-spacing:.04em;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
  const tr = d.createElement('div'); tr.style.cssText = 'height:3px;background:' + RULE; const fill = d.createElement('div'); fill.style.cssText = 'height:100%;width:100%;background:' + BLUE; tr.appendChild(fill);
  const icg = d.createElement('div'); icg.style.cssText = 'flex:none;display:flex;align-items:center'; ic.appendChild(icg); tx.append(lab, nm, tr); bar.append(ic, tx);
  const ov = d.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:60;display:none;background:rgba(0,0,0,.55);font-family:' + F;
  const pn = d.createElement('div'); pn.style.cssText = 'position:absolute;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));bottom:max(10px,env(safe-area-inset-bottom));max-width:820px;margin:0 auto;display:flex;flex-direction:column;background:' + INK + ';border-top:2px solid ' + BLUE + ';color:#fff';
  const hd = d.createElement('div'); hd.style.cssText = 'flex:none;display:flex;align-items:center;gap:12px;padding:0 0 0 14px;border-bottom:2px solid ' + RULE;
  const ht = d.createElement('div'); ht.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;padding:10px 0'; ht.innerHTML = '<div style="font:900 15px ' + F + ';letter-spacing:.08em">SUPER MOVES</div><div data-sub style="font:700 10px ' + F + ';letter-spacing:.06em;color:' + SUB + '"></div>';
  const x = d.createElement('button'); x.setAttribute('aria-label', 'Close'); x.textContent = '✕'; x.style.cssText = 'flex:none;width:52px;align-self:stretch;min-height:44px;border:0;border-left:2px solid ' + RULE + ';border-radius:0;background:' + INK + ';color:#fff;font:900 18px ' + F + ';cursor:pointer';
  hd.append(ht, x);
  const sc = d.createElement('div'); sc.style.cssText = 'flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;background:' + INK; const gr = d.createElement('div'); gr.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));background:' + INK + ';align-content:start';
  sc.appendChild(gr); pn.append(hd, sc); ov.appendChild(pn); d.body.append(bar, ov);
  const css = d.createElement('style'); css.textContent = '@keyframes supReady{0%,100%{background:' + BLUE + '}50%{background:#7fc8ff}}@keyframes supNo{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'; d.head.appendChild(css);
  ui = { bar, ic, icg, tx, lab, nm, fill, ov, gr, x, sub: ht.querySelector('[data-sub]') }; return ui; }
export function fighterSuper(o = {}) {
  const S = { cd: 0, cdMax: 1, open: false, slowOut: 0, practice: !!o.practice, pick: LS('fighter.super.pick', 'whirl'), down: null, flash: 0, key: '' };
  const U = mkUI(), vis = () => { try { if (document.querySelector('[data-super-hide]')) return false; return o.visible ? !!o.visible() : true; } catch (e) { return false; } };   // pages mark start / result cards with data-super-hide
  const unlocked = () => S.practice ? SUPERS.map(m => m.key) : [...new Set([...START, ...LS('fighter.super.unlocked', [])])];
  const cur = () => { const u = unlocked(); let m = SUPERS.find(q => q.key === S.pick); if (!m || !u.includes(m.key)) m = SUPERS.find(q => q.key === u[0]) || SUPERS[0]; return m; };
  let mc = null; const m0w = () => { const n = cur().name; if (S.mwN === n) return S.mw; if (!mc) mc = document.createElement('canvas').getContext('2d'); mc.font = '900 11px Archivo, system-ui, sans-serif'; S.mwN = n; S.mw = Math.ceil(40 + 16 + mc.measureText(n).width + n.length * 0.44); return S.mw; };
  const draw = () => { if (!vis()) { U.bar.style.display = 'none'; if (S.open) api.close(); return; } U.bar.style.display = 'flex';
    const pad = (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) || innerWidth < 900; const slot = pad ? document.querySelector('[data-super-slot]') : null, sr = slot && slot.getBoundingClientRect(), dock = !!(sr && sr.width > 0);
    const lk = pad + '|' + (innerWidth > innerHeight) + '|' + lyV + '|' + dock; if (lk !== S.lk) { S.lk = lk; S.pad = pad; S.dock = dock; S.key = ''; layout(pad, dock); }
    if (dock && S.dw !== m0w()) { S.dw = m0w(); slot.style.width = S.dw + 'px'; }   // s342n: the docked SUPER is only as wide as the move's name (icon 40 + padding 16 + name)
    if (dock) { const B = U.bar.style; B.left = sr.left + 'px'; B.top = sr.top + 'px'; B.width = sr.width + 'px'; B.height = sr.height + 'px'; }   // s342b Ben: on phones the SUPER button docks in the middle of the bottom strip (FOX SWAP · SUPER · ITEM)
    /* phone: caps the 1-4 button column · desktop: bottom-right above the key strip */
    const m = cur(), rdy = S.cd <= 0;
    const k = m.key + (rdy ? 1 : 0); if (k !== S.key) { S.key = k; U.icg.innerHTML = icon(m.icon, '#fff', S.dock ? 20 : S.pad ? 16 : 22); U.nm.textContent = m.name; U.ic.style.animation = rdy ? 'supReady 1.2s ease-in-out infinite' : 'none'; U.ic.style.background = rdy ? BLUE : INK; }
    if (S.pad) U.lab.style.color = '#fff';
    U.lab.style.display = S.dock && rdy ? 'none' : 'block'; U.lab.textContent = S.dock ? Math.ceil(S.cd) + ' S' : S.pad ? (rdy ? 'READY' : Math.ceil(S.cd) + ' S') : rdy ? 'READY · HOLD: PICK' : 'RECHARGING · ' + Math.ceil(S.cd) + ' S'; U.lab.style.color = rdy ? '#fff' : SUB;
    U.fill.style.width = (rdy ? 100 : Math.round((1 - S.cd / S.cdMax) * 100)) + '%'; U.bar.style.background = S.flash > 0 ? '#f3f2f2' : INK; U.nm.style.color = S.flash > 0 ? INK : '#fff'; };
  // s341j Ben: on phones the bar is a compact SUPER button BETWEEN the joystick and the menu button (above the eye); desktop keeps the wide bar bottom-right
  // s342 HUD Layout Workshop offsets (localStorage hud.layout.v1 → [portrait|landscape].super = { x, y, s })
  let lyV = 0; const lyBump = () => { lyV++; draw(); }; addEventListener('storage', lyBump); addEventListener('hud-layout', lyBump);
  const lyT = () => { try { const o = ((JSON.parse(localStorage.getItem('hud.layout.v1')) || {})[innerWidth > innerHeight ? 'landscape' : 'portrait'] || {}).super; return o ? 'translate(' + (o.x || 0) + 'px,' + -(o.y || 0) + 'px) scale(' + (o.s || 1) + ')' : ''; } catch (e) { return ''; } };
  const layout = (pad, dock) => { const B = U.bar.style, I = U.ic.style, N = U.nm.style, T = U.tx.style;
    if (dock) { Object.assign(B, { right: 'auto', bottom: 'auto', flexDirection: 'row', transform: '', borderTop: '0', borderLeft: '0', borderRight: '0' });
      Object.assign(I, { flex: '0 0 40px', borderRight: '2px solid ' + RULE, borderBottom: '0', justifyContent: 'center', gap: '0', padding: '0' }); U.tx.insertBefore(U.lab, U.nm); U.lab.style.fontSize = '9px';
      Object.assign(T, { padding: '0 8px', gap: '4px', justifyContent: 'center' }); Object.assign(N, { whiteSpace: 'nowrap', overflow: 'visible', fontSize: '11px', lineHeight: '1', display: 'block', webkitLineClamp: '', webkitBoxOrient: '' }); return; }
    B.top = 'auto'; B.borderTop = '2px solid ' + BLUE; B.borderLeft = B.borderRight = '0'; U.lab.style.display = 'block';
    if (pad) { Object.assign(B, { left: o.padLeft || 'calc(env(safe-area-inset-left,0px) + 143px)', right: 'auto', bottom: o.padBottom || 'calc(env(safe-area-inset-bottom,0px) + 120px)', width: '92px', height: '58px', flexDirection: 'column', transform: lyT() });
      Object.assign(I, { flex: '0 0 22px', borderRight: '0', borderBottom: '2px solid ' + RULE, justifyContent: 'flex-start', gap: '6px', padding: '0 7px' }); U.ic.appendChild(U.lab); U.lab.style.fontSize = '9px';
      Object.assign(T, { padding: '3px 7px 5px', gap: '3px', justifyContent: 'space-between' }); Object.assign(N, { whiteSpace: 'normal', fontSize: '10px', lineHeight: '1.05', display: '-webkit-box', webkitLineClamp: '2', webkitBoxOrient: 'vertical' }); }
    else { Object.assign(B, { left: 'auto', right: 'max(14px,env(safe-area-inset-right))', bottom: o.deskBottom || '44px', width: '196px', height: '46px', flexDirection: 'row', transform: '' });
      Object.assign(I, { flex: '0 0 44px', borderRight: '2px solid ' + RULE, borderBottom: '0', justifyContent: 'center', gap: '0', padding: '0' }); U.tx.insertBefore(U.lab, U.nm); U.lab.style.fontSize = '9px';
      Object.assign(T, { padding: '0 10px', gap: '3px', justifyContent: 'center' }); Object.assign(N, { whiteSpace: 'nowrap', fontSize: '12px', lineHeight: '1', display: 'block', webkitLineClamp: '', webkitBoxOrient: '' }); } };
  const grid = () => { const u = unlocked(), m0 = cur(); U.sub.textContent = 'TAP ONE TO PICK IT · ONE RECHARGE FOR ALL · ' + u.length + ' / ' + SUPERS.length + ' UNLOCKED'; U.gr.innerHTML = '';
    for (const m of SUPERS) { const on = u.includes(m.key), me = m.key === m0.key, b = document.createElement('div'); b.setAttribute('role', 'button'); if (!on) b.setAttribute('aria-disabled', 'true');
      b.style.cssText = 'box-sizing:border-box;min-height:84px;border-right:2px solid ' + RULE + ';border-bottom:2px solid ' + RULE + ';padding:10px 10px 9px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;user-select:none;-webkit-user-select:none;text-align:left;font-family:inherit;cursor:' + (on ? 'pointer' : 'default') + ';background:' + (me ? '#f3f2f2' : INK) + ';color:' + (me ? INK : '#fff') + ';opacity:' + (on ? 1 : 0.38);
      b.innerHTML = '<div style="display:flex;align-items:center;gap:8px;width:100%">' + icon(m.icon, me ? INK : on ? BLUE : '#fff', 20) + '<span style="font:800 10px Archivo,system-ui,sans-serif;letter-spacing:.06em;color:' + (me ? '#5a5652' : SUB) + '">' + m.num + '</span></div>'
        + '<div style="flex:1;font:900 11.5px Archivo,system-ui,sans-serif;letter-spacing:.04em;line-height:1.2">' + m.name + '</div><div style="white-space:nowrap;line-height:1.1;font:700 9px Archivo,system-ui,sans-serif;letter-spacing:.06em;color:' + (me ? '#5a5652' : SUB) + '">' + (on ? (me ? 'PICKED · ' : '') + m.cd + ' S' : 'LOCKED') + '</div>';
      if (on) b.onclick = e => { e.stopPropagation(); S.pick = m.key; SV('fighter.super.pick', m.key); SFX.play('draw', { p: 0.8, v: 0.6 }); api.close(); };
      U.gr.appendChild(b); } };
  const no = () => { U.bar.style.animation = 'none'; void U.bar.offsetWidth; U.bar.style.animation = 'supNo .25s'; SFX.play('holster', { p: 0.5 }); };
  const press = () => { if (S.open || S.down || !vis()) return; S.down = { t: 0 }; };
  const release = () => { if (!S.down) return; const d = S.down; S.down = null; if (d.t < HOLD && !S.open) api.tap(); };
  U.bar.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); try { U.bar.setPointerCapture(e.pointerId); } catch (er) {} press(); };
  U.bar.onpointerup = e => { e.stopPropagation(); release(); }; U.bar.onpointercancel = () => { S.down = null; };
  U.ov.onclick = e => { if (e.target === U.ov) api.close(); }; U.x.onclick = () => api.close();
  const kd = e => { if (e.code !== 'KeyQ' || e.repeat || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; if (S.open) { api.close(); return; } press(); }, ku = e => { if (e.code === 'KeyQ') release(); };
  if (o.keys !== false) { addEventListener('keydown', kd); addEventListener('keyup', ku); }
  const api = {
    SUPERS, get frozen() { return false; }, get isOpen() { return S.open; }, get ready() { return S.cd <= 0; }, get picked() { return cur(); }, get meter() { return S.cd <= 0 ? 1 : 1 - S.cd / S.cdMax; },
    set practice(v) { S.practice = !!v; S.key = ''; }, add() {}, stick() {}, btn() { return null; },
    // TAP: fire the picked super now → onFire(mv) and returns mv (null while recharging)
    tap() { if (S.open || !vis()) return null; if (S.cd > 0) { no(); return null; } const m = cur(); S.cdMax = S.cd = S.practice && o.fastLab ? 1 : m.cd; S.slowOut = 0.2; S.flash = 0.12; S.key = ''; SFX.play('power');
      try { o.onFire && o.onFire(m); } catch (e) {} draw(); return m; },
    openGrid() { if (S.open || !vis()) return; S.open = true; S.down = null; grid(); U.ov.style.display = 'block'; SFX.play('sheath', { p: 0.7, v: 0.6 }); },
    close() { if (!S.open) return; S.open = false; U.ov.style.display = 'none'; S.key = ''; draw(); },
    unlock(key) { const l = LS('fighter.super.unlocked', []); if (!l.includes(key)) { l.push(key); SV('fighter.super.unlocked', l); } S.key = ''; },
    pick(key) { S.pick = key; SV('fighter.super.pick', key); S.key = ''; draw(); }, resetCooldown() { S.cd = 0; S.key = ''; draw(); },
    timeScale() { return S.open ? 0 : S.slowOut > 0 ? 0.4 : 1; },
    update(realDt) { if (S.down) { S.down.t += realDt; if (S.down.t >= HOLD) api.openGrid(); } if (!S.open && S.cd > 0) { S.cd = Math.max(0, S.cd - realDt); if (S.cd <= 0) { S.key = ''; SFX.play('draw', { p: 1.3, v: 0.5 }); } }
      if (S.slowOut > 0) S.slowOut -= realDt; if (S.flash > 0) S.flash -= realDt; draw(); },
    hide() { U.bar.style.display = 'none'; api.close(); }, refresh: () => draw(),
    destroy() { api.close(); U.bar.style.display = 'none'; removeEventListener('keydown', kd); removeEventListener('keyup', ku); },
  };
  window.__fighterSuper = api; draw(); return api;
}
