// Blind Canvas mini game KIT: the shared pieces every painting game uses.
// Look: Claude Design's Blind Canvas game style. Archivo 900, uppercase, black / white / red #ec3013, square corners,
// labels flush left, hard black shadows on alerts. The HUD is fixed to the screen, not the painting.
//
//   import * as K from '../kit.js';
//   const S = K.space(ctx)            painting coordinates: S.P(u, v) → board [x, y]; u, v run 0..1 from the top-left
//   const ui = K.ui(cfg)              screen HUD: panel, banner, alert, countdown, pop, buttons, frame, end
//   K.tone / K.noise / K.chord / K.wind / K.sfx.*      sound (all optional pan −1..1)
//   K.finale(G, {...})                ends the game: the painting's animation fades in + the end panel
//   K.best(key, value, 'higher'|'lower')   remembers a best score on this phone
//
// Every game is an object { title, start(ctx), update(dt), pointer(kind, ev), pause(), resume(), stop(), over, debug }.
// ctx = { group, h, camera, renderer, say, buzz, work, story, bot }. When ctx.bot is true (…&bot=1 in the link),
// the game plays itself so it can be tested from start to finale.
import * as THREE from 'three';

export const RED = '#ec3013', BLUE = '#1f4fd8';
export const isBot = () => /[?&]bot=1\b/.test(location.search);

/* ───────────────────────── sound ───────────────────────── */
let ac = null;
export function audio() {
  if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
}
function out(pan) {
  const a = audio(); if (!a) return null;
  if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan || 0)); p.connect(a.destination); return p; }
  return a.destination;
}
export function tone(f, dur = 0.15, { type = 'sine', vol = 0.14, pan = 0, slide = 0, delay = 0, attack = 0.01 } = {}) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out(pan)); o.start(t); o.stop(t + dur + 0.03);
}
export function noise(dur = 0.2, { vol = 0.2, pan = 0, freq = 900, q = 1, type = 'bandpass', delay = 0, sweepTo = 0 } = {}) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay, n = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * dur)), a.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.6);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = n;
  f.type = type; f.frequency.setValueAtTime(freq, t); if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur); f.Q.value = q; g.gain.value = vol;
  s.connect(f).connect(g).connect(out(pan)); s.start(t);
}
export function chord(freqs, dur = 1.2, { vol = 0.07, type = 'triangle', spread = 0.05, delay = 0, pan = 0 } = {}) {
  freqs.forEach((f, i) => tone(f, dur, { vol, type, pan, delay: delay + i * spread, attack: 0.03 }));
}
export function wind(dur = 1.5, { vol = 0.25, pan = 0, from = 300, to = 1400 } = {}) { noise(dur, { vol, pan, freq: from, sweepTo: to, q: 0.9 }); }
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
export const SCALES = {                                   // handy note sets (Hz)
  major: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79].map(midi),
  penta: [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84].map(midi),
  minor: [57, 60, 62, 64, 67, 69, 72, 74, 76].map(midi),
  blues: [60, 63, 65, 66, 67, 70, 72, 75, 77].map(midi),
};
export const sfx = {
  good: (pan = 0, n = 0) => { const s = SCALES.penta, f = s[Math.min(s.length - 1, n % s.length)]; tone(f, 0.35, { type: 'triangle', vol: 0.15, pan }); tone(f * 2, 0.22, { vol: 0.05, pan, delay: 0.03 }); },
  bad: (pan = 0) => { tone(150, 0.45, { type: 'sawtooth', vol: 0.09, pan, slide: -70 }); noise(0.25, { vol: 0.2, freq: 180, pan }); },
  tick: () => tone(520, 0.14, { type: 'square', vol: 0.12 }),
  go: () => tone(1040, 0.25, { type: 'square', vol: 0.12 }),
  ping: (pan = 0, f = 880, vol = 0.08) => tone(f, 0.12, { vol, pan }),
  whoosh: (pan = 0) => noise(0.35, { vol: 0.25, freq: 600, sweepTo: 2400, pan, q: 0.8 }),
  win: () => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, 0.9, { type: 'triangle', vol: 0.13, delay: i * 0.13 })); },
  lose: () => { [392, 349.2, 293.7].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.1, delay: i * 0.16 })); },
};

/* ───────────────────────── pictures ───────────────────────── */
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const glowTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
export const ringTex = canvasTex(128, 128, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 9; g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.stroke(); });
export const dotTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.5, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
const emojiCache = new Map();
// an emoji (or any short text) on a transparent square; ring:true adds a dark disc + coloured ring so it reads on busy art
export function emojiTex(e, { ring = false, color = '#fff', bg = 'rgba(10,10,14,.6)' } = {}) {
  const key = e + ring + color + bg; if (emojiCache.has(key)) return emojiCache.get(key);
  const t = canvasTex(160, 160, (g) => {
    if (ring) { g.fillStyle = bg; g.beginPath(); g.arc(80, 80, 74, 0, Math.PI * 2); g.fill(); g.strokeStyle = color; g.lineWidth = 6; g.stroke(); }
    g.font = '100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 80, 88);
  });
  emojiCache.set(key, t); return t;
}
// a word in Design's style: white Archivo 900 on a black or coloured block
export function wordTex(text, { bg = '#000', fg = '#fff', bar = RED, w = 512, h = 128 } = {}) {
  return canvasTex(w, h, (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H - 12); g.fillStyle = bar; g.fillRect(0, H - 12, W, 12);
    let fs = 78; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`;
    while (g.measureText(text).width > W - 40 && fs > 26) { fs -= 4; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; }
    g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(text.toUpperCase(), 20, (H - 12) / 2 + 3);
  });
}
export function sprite(tex, size, { color, additive = false, opacity = 1, order = 10 } = {}) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: color ? new THREE.Color(color) : undefined, transparent: true, depthWrite: false, opacity,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
  s.scale.set(size, size, 1); s.renderOrder = order; return s;
}
export function plane(tex, w, h, { opacity = 1, order = 10, additive = false } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
  m.renderOrder = order; return m;
}
// a burst of coloured dots (for catches, splashes, wins): call burst.update(dt) each frame
export function bursts(root) {
  const bits = [];
  return {
    add(x, y, color = '#ffd25a', n = 18, speed = 0.35) {
      const c = new THREE.Color(color);
      for (let i = 0; i < n; i++) {
        const s = sprite(dotTex, 0.012 + Math.random() * 0.016, { color: c.clone().offsetHSL((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.4) * 0.2), order: 30 });
        const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.8);
        s.position.set(x, y, 0.05); root.add(s); bits.push({ s, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 0.08, life: 0.6 + Math.random() * 0.5 });
      }
    },
    update(dt) {
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i]; b.life -= dt; b.vy -= 0.45 * dt; b.s.position.x += b.vx * dt; b.s.position.y += b.vy * dt; b.s.material.opacity = Math.max(0, Math.min(1, b.life * 1.6));
        if (b.life <= 0) { root.remove(b.s); b.s.material.dispose(); bits.splice(i, 1); }
      }
    },
  };
}

/* ───────────────────────── painting space ───────────────────────── */
// The painting is 1 unit wide and h tall, centred on 0,0, y up. Configs give positions as u,v (0..1 from the top-left),
// so they work at any photo size.
export function space(ctx) {
  const h = ctx.h;
  const P = (u, v) => [u - 0.5, (0.5 - v) * h];
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), pl = new THREE.Plane(), hit = new THREE.Vector3(), inv = new THREE.Matrix4();
  // where a finger touches the painting, in board coordinates (and u,v)
  function toBoard(ev, root) {
    const r = ctx.renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, ctx.camera);
    root.updateWorldMatrix(true, false);
    pl.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).transformDirection(root.matrixWorld), new THREE.Vector3().setFromMatrixPosition(root.matrixWorld));
    if (!ray.ray.intersectPlane(pl, hit)) return null;
    inv.copy(root.matrixWorld).invert(); const p = hit.clone().applyMatrix4(inv);
    return { x: p.x, y: p.y, u: p.x + 0.5, v: 0.5 - p.y / h };
  }
  // which third of the SCREEN a touch is in (−1 left, 0 middle, 1 right): for lane games played without looking
  const screenThird = (ev) => { const x = ev.clientX / innerWidth; return x < 0.36 ? -1 : x > 0.64 ? 1 : 0; };
  return { h, P, toBoard, screenThird };
}

/* ───────────────────────── screen HUD (Design style) ───────────────────────── */
let cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style');
  s.textContent = `
  .mgk{position:fixed;z-index:11;font-family:Archivo,'Arial Black',Arial,sans-serif;font-weight:900;text-transform:uppercase;color:#fff;pointer-events:none;-webkit-user-select:none;user-select:none}
  .mgk-panel{left:calc(12px + env(safe-area-inset-left));right:calc(12px + env(safe-area-inset-right));top:calc(66px + env(safe-area-inset-top));background:#000;border-bottom:8px solid ${RED};padding:10px 16px 12px}
  .mgk-panel.warn{background:${RED};border-bottom-color:#000}
  .mgk-k{font-size:13px;letter-spacing:.16em;color:${RED};line-height:1}
  .mgk-panel.warn .mgk-k{color:#000}
  .mgk-v{font-size:clamp(22px,7vw,34px);line-height:1.02;margin-top:6px;letter-spacing:.01em}
  .mgk-v small{font-size:.55em;letter-spacing:.06em;margin-left:6px}
  .mgk-segs{display:flex;gap:3px;margin-top:9px;height:10px}
  .mgk-segs i{flex:1;background:#3a3a3a}
  .mgk-segs i.on{background:${RED}}
  .mgk-panel.warn .mgk-segs i.on{background:#000}
  .mgk-sub{font:700 14px/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;letter-spacing:0;color:#d6d6d6;margin-top:6px}
  .mgk-banner{left:calc(12px + env(safe-area-inset-left));right:calc(12px + env(safe-area-inset-right));top:calc(66px + env(safe-area-inset-top));background:#000;border-bottom:8px solid ${RED};padding:14px 20px 18px}
  .mgk-banner .t{font-size:clamp(32px,11vw,54px);line-height:.95;margin-top:8px}
  .mgk-banner .s{font:700 clamp(16px,4.6vw,21px)/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;margin-top:10px;color:#fff}
  .mgk-alert{left:calc(12px + env(safe-area-inset-left));right:calc(18px + env(safe-area-inset-right));top:calc(196px + env(safe-area-inset-top));background:${RED};border:3px solid #000;box-shadow:6px 6px 0 #000;padding:12px 18px 14px}
  .mgk-alert.blue{background:${BLUE}} .mgk-alert.black{background:#000;border-color:#fff;box-shadow:6px 6px 0 ${RED}}
  .mgk-alert .t{font-size:clamp(26px,8.6vw,42px);line-height:.98}
  .mgk-alert .s{font:700 17px/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;margin-top:6px}
  .mgk-count{left:calc(12px + env(safe-area-inset-left));top:calc(300px + env(safe-area-inset-top));min-width:132px;height:132px;padding:0 24px;background:${RED};border:3px solid #000;box-shadow:6px 6px 0 #000;
    display:flex;align-items:center;font-size:104px;line-height:1}
  .mgk-pop{background:#000;border-bottom:4px solid ${RED};padding:4px 10px 3px;font-size:30px;transform:translate(-50%,-50%)}
  .mgk-frame{inset:0;border:8px solid ${RED};z-index:9}
  .mgk-btns{left:calc(12px + env(safe-area-inset-left));right:calc(12px + env(safe-area-inset-right));bottom:calc(96px + env(safe-area-inset-bottom));display:flex;gap:10px;pointer-events:none}
  .mgk-btns button{pointer-events:auto;flex:1;min-height:66px;padding:0 12px;border:2px solid #000;background:#fff;color:#000;cursor:pointer;touch-action:none;
    font:900 clamp(15px,4.6vw,20px)/1 Archivo,'Arial Black',Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:8px}
  .mgk-btns button.red{background:${RED};color:#fff} .mgk-btns button.black{background:#000;color:#fff;border-color:#fff} .mgk-btns button.blue{background:${BLUE};color:#fff}
  .mgk-btns button.down{transform:translate(2px,2px);filter:brightness(.85)}
  .mgk-btns button:focus-visible{outline:3px solid #7fdcff;outline-offset:2px}
  .mgk-end{left:calc(12px + env(safe-area-inset-left));right:calc(12px + env(safe-area-inset-right));top:calc(66px + env(safe-area-inset-top));pointer-events:auto}
  .mgk-end .top{background:${RED};padding:12px 18px 14px}
  .mgk-end .top .k{font-size:14px;letter-spacing:.16em;color:#000}
  .mgk-end .top .t{font-size:clamp(28px,9vw,46px);line-height:.98;margin-top:6px}
  .mgk-end .cells{display:flex;background:#000}
  .mgk-end .cells div{flex:1;padding:10px 16px 12px;border-left:2px solid #fff}
  .mgk-end .cells div:first-child{border-left:0}
  .mgk-end .cells b{display:block;font-size:13px;letter-spacing:.14em;color:#d6d6d6}
  .mgk-end .cells span{display:block;font-size:clamp(30px,10vw,52px);line-height:1;margin-top:4px}
  .mgk-end .line{background:#000;border-top:2px solid #333;padding:10px 16px 12px;font:700 15px/1.4 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;color:#eee}
  .mgk-end .best{background:#fff;color:#000;padding:8px 16px;font-size:18px;display:flex;align-items:center;gap:10px}
  .mgk-end .best i{width:14px;height:14px;background:${RED};display:inline-block}
  .mgk-end button{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:58px;margin-top:10px;padding:0 18px;border:2px solid #000;background:#fff;color:#000;cursor:pointer;
    font:900 20px/1 Archivo,'Arial Black',Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase}
  @media (max-height:640px){.mgk-alert{top:calc(150px + env(safe-area-inset-top))}.mgk-count{top:calc(190px + env(safe-area-inset-top))}}
  `;
  document.head.appendChild(s);
}
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function ui() {
  css();
  const els = new Set();
  const make = (cls, html = '') => { const e = document.createElement('div'); e.className = 'mgk ' + cls; e.setAttribute('aria-hidden', 'true'); e.innerHTML = html; document.body.appendChild(e); els.add(e); return e; };
  let panelEl = null, bannerEl = null, alertEl = null, countEl = null, frameEl = null, btnEl = null, endEl = null, alertT = 0, bannerT = 0;
  const U = {
    // the score panel: kicker (small red), value (big), optional segments [filled, total] and a sub line
    panel(kicker, value, { segs, sub, warn = false } = {}) {
      if (!panelEl) panelEl = make('mgk-panel');
      panelEl.classList.toggle('warn', !!warn);
      panelEl.innerHTML = `<div class="mgk-k">${esc(kicker)}</div><div class="mgk-v">${value}</div>` +
        (segs ? `<div class="mgk-segs">${Array.from({ length: segs[1] }, (_, i) => `<i class="${i < segs[0] ? 'on' : ''}"></i>`).join('')}</div>` : '') +
        (sub ? `<div class="mgk-sub">${esc(sub)}</div>` : '');
      panelEl.style.display = 'block';
    },
    hidePanel() { if (panelEl) panelEl.style.display = 'none'; },
    // the start banner ("MINI GAME" / title / instruction)
    banner(title, sub, secs = 0, kicker = 'Mini game') {
      if (!bannerEl) bannerEl = make('mgk-banner');
      bannerEl.innerHTML = `<div class="mgk-k">${esc(kicker)}</div><div class="t">${esc(title)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}`;
      bannerEl.style.display = 'block'; bannerT = secs; if (panelEl) panelEl.style.visibility = 'hidden';
    },
    hideBanner() { if (bannerEl) bannerEl.style.display = 'none'; if (panelEl) panelEl.style.visibility = ''; bannerT = 0; },
    // a loud alert block (kind: red | blue | black), for warnings, hits, combos
    alert(title, sub, secs = 1.2, kind = 'red') {
      if (!alertEl) alertEl = make('mgk-alert');
      alertEl.className = 'mgk mgk-alert ' + kind;
      alertEl.innerHTML = `<div class="t">${esc(title)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}`;
      alertEl.style.display = 'block'; alertT = secs;
    },
    hideAlert() { if (alertEl) alertEl.style.display = 'none'; alertT = 0; },
    // 3 · 2 · 1 · GO! (0.7 s each), then onGo()
    countdown(onGo, { from = 3, step = 0.7 } = {}) {
      if (!countEl) countEl = make('mgk-count');
      let n = from, t = 0; countEl.textContent = n; countEl.style.display = 'flex'; sfx.tick();
      U._count = (dt) => {
        t += dt; if (t < step) return; t = 0; n--;
        if (n > 0) { countEl.textContent = n; sfx.tick(); }
        else if (n === 0) { countEl.textContent = 'GO!'; sfx.go(); }
        else { countEl.style.display = 'none'; U._count = null; onGo(); }
      };
    },
    // a small "+1" tag that rises and fades at a screen point (or the middle)
    pop(text, x = innerWidth / 2, y = innerHeight * 0.45) {
      const e = make('mgk-pop'); e.textContent = text; e.style.left = x + 'px'; e.style.top = y + 'px';
      let t = 0; const id = setInterval(() => { t += 0.03; e.style.top = (y - t * 60) + 'px'; e.style.opacity = String(Math.max(0, 1 - t / 0.8)); if (t > 0.8) { clearInterval(id); e.remove(); els.delete(e); } }, 30);
    },
    frame(on) { if (!frameEl) frameEl = make('mgk-frame'); frameEl.style.display = on ? 'block' : 'none'; },
    // a row of big buttons above the Stop button: [{ label, icon, kind, aria, press(), release() }]
    buttons(list) {
      if (btnEl) { btnEl.remove(); els.delete(btnEl); btnEl = null; }
      if (!list || !list.length) return [];
      btnEl = make('mgk-btns'); btnEl.removeAttribute('aria-hidden');
      return list.map(b => {
        const e = document.createElement('button'); e.type = 'button'; e.className = b.kind || '';
        e.innerHTML = `<span>${esc(b.label)}</span>${b.icon ? `<span aria-hidden="true">${b.icon}</span>` : ''}`;
        if (b.aria) e.setAttribute('aria-label', b.aria);
        const down = (ev) => { ev.preventDefault(); e.classList.add('down'); audio(); b.press && b.press(); };
        const up = () => { if (!e.classList.contains('down')) return; e.classList.remove('down'); b.release && b.release(); };
        e.addEventListener('pointerdown', down); for (const k of ['pointerup', 'pointercancel', 'pointerleave']) e.addEventListener(k, up);
        e.addEventListener('contextmenu', ev => ev.preventDefault());
        e.addEventListener('keydown', ev => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) { ev.preventDefault(); down(ev); } });
        e.addEventListener('keyup', ev => { if (ev.key === ' ' || ev.key === 'Enter') up(); });
        btnEl.appendChild(e); return e;
      });
    },
    // the end panel: red top (kicker + title), score cells, a line (the artist's words), NEW BEST row, story button
    end({ kicker = 'Game over', title, cells = [], line, best = false, storyLabel, onStory }) {
      U.hideBanner(); U.hideAlert(); U.buttons([]); if (panelEl) panelEl.style.display = 'none';
      if (!endEl) endEl = make('mgk-end'); endEl.removeAttribute('aria-hidden');
      endEl.innerHTML = `<div class="top"><div class="k">${esc(kicker)}</div><div class="t">${esc(title)}</div></div>` +
        (cells.length ? `<div class="cells">${cells.map(c => `<div><b>${esc(c.k)}</b><span>${esc(c.v)}</span></div>`).join('')}</div>` : '') +
        (best ? `<div class="best"><i></i>New best!</div>` : '') +
        (line ? `<div class="line">${esc(line)}</div>` : '') +
        (onStory ? `<button type="button"><span>${esc(storyLabel || 'The artist’s story')}</span><span aria-hidden="true">▶</span></button>` : '');
      if (onStory) endEl.querySelector('button').onclick = onStory;
      endEl.style.display = 'block';
    },
    update(dt) {
      if (U._count) U._count(dt);
      if (alertT > 0) { alertT -= dt; if (alertT <= 0) U.hideAlert(); }
      if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) U.hideBanner(); }
    },
    destroy() { for (const e of els) e.remove(); els.clear(); panelEl = bannerEl = alertEl = countEl = frameEl = btnEl = endEl = null; U._count = null; },
  };
  return U;
}

/* ───────────────────────── intro + finale ───────────────────────── */
// Shows the start banner, speaks the instructions, waits, counts down, then calls go().
export function intro(G, { title, how, say }) {
  G.ui.banner(title, how, 0);
  G.say(say || (title + '. ' + how));
  G._introT = G.bot ? 0.3 : 2.4;
  G._introGo = () => { G.ui.hideBanner(); G.ui.countdown(() => { G.playing = true; G.onGo && G.onGo(); }, G.bot ? { from: 1, step: 0.2 } : undefined); };
}
export function introUpdate(G, dt) {
  if (G._introT > 0) { G._introT -= dt; if (G._introT <= 0) G._introGo(); }
}
// Ends the game: win chord, the painting's own animation fades in over it, and the end panel.
export function finale(G, { won = true, title, kicker, cells = [], line, best = false, say }) {
  G.playing = false; G.over = true;
  G.ui.buttons([]); G.ui.frame(false);
  won ? sfx.win() : sfx.lose(); G.buzz(won ? [60, 40, 60, 40, 180] : [200]);
  const artist = (G.work && G.work.artist) || 'the artist';
  // "Wayne's story"; "April & Melissa's story"; a group name like "Academy of Music for the Blind" → "Their story"
  const words = artist.trim().split(/\s+/);
  const first = /&| and /.test(artist) ? artist : words.length > 3 ? null : words[0];
  G.ui.end({ kicker: kicker || (won ? 'You did it' : 'Game over'), title, cells, line, best,
    storyLabel: first ? first + '’s story' : 'Their story', onStory: () => G.story && G.story() });
  G.say(say || (title + '. ' + (line || '')));
  const src = G.work && G.work.overlay && G.work.overlay.anim;
  if (src) {
    const v = document.createElement('video'); Object.assign(v, { src, loop: true, muted: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
    v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
    m.position.z = 0.09; m.renderOrder = 60; m.visible = false; G.root.add(m);
    v.addEventListener('playing', () => { m.visible = true; });
    G._anim = { m, v, t: 0 };
    setTimeout(() => v.play().catch(() => {}), 900);
  }
}
export function finaleUpdate(G, dt) {
  if (G._anim && G._anim.m.visible) { G._anim.t += dt; G._anim.m.material.opacity = Math.min(1, G._anim.t * 0.7); }
}
export function cleanup(G) {
  if (!G) return;
  if (G._anim) { G._anim.v.pause(); G._anim.v.removeAttribute('src'); G._anim.v.load(); }
  if (G.root && G.group) G.group.remove(G.root);
  if (G.root) G.root.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map && !o.material.map._shared) { /* textures are shared caches; leave them */ } });
  if (G.ui) G.ui.destroy();
}

/* ───────────────────────── scores ───────────────────────── */
export function best(key, value, better = 'higher') {
  let prev = null; try { const v = localStorage.getItem('bc-best-' + key); prev = v === null ? null : +v; } catch (e) {}
  const isBest = prev === null || (better === 'higher' ? value > prev : value < prev);
  if (isBest) { try { localStorage.setItem('bc-best-' + key, String(value)); } catch (e) {} }
  return { isBest, best: isBest ? value : prev };
}

/* ───────────────────────── base game ───────────────────────── */
// Most engines start like this: makeBase(ctx) → G with root group, ui, painting space, bursts; then add their own state.
export function makeBase(ctx) {
  audio();
  const G = { ...ctx, bot: ctx.bot ?? isBot(), root: new THREE.Group(), ui: ui(), t: 0, playing: false, over: false, paused: false };
  ctx.group.add(G.root);
  G.S = space(ctx); G.fx = bursts(G.root);
  return G;
}
