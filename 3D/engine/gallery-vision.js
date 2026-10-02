// Blind Canvas gallery: "See through their eyes" spots.
// Two floor circles in the main hall. Step on one and choose "Stand here": you're held in place, the camera moves to
// your fox's eyes, and Ben's vision-condition filters (from the Patient Experience simulator: RP, cataracts, macular
// degeneration, floaters, glaucoma, with the same severity curves) are laid over the live 3D view.
// Twists for 3D:
//   • the clear spot of vision follows your eyes: it leads a little in the direction you turn, then settles
//   • floaters lag behind your look and drift back, like real ones in the vitreous
//   • stepping on, your sight "settles in" to the chosen severity; stepping off, it clears
//   • Guided look slowly turns your head between the big screen and the paintings around you
import * as THREE from '../vendor/three/three.module.js';

export const CONDITIONS = [
  { id: 'rp', label: 'Retinitis Pigmentosa', chip: 'Tunnel vision', desc: 'A shrinking tunnel of sight: peripheral vision narrows inward, with early night blindness. (Ben\'s diagnosis.)' },
  { id: 'cataracts', label: 'Cataracts', chip: 'Cataracts', desc: "The eye's lens clouds over: a milky, glaring haze with faded colour and contrast." },
  { id: 'amd', label: 'Macular Degeneration', chip: 'Macular deg.', desc: 'Central vision blurs and darkens: detail vanishes where you look, while the edges linger.' },
  { id: 'floaters', label: 'Floaters', chip: 'Floaters', desc: 'Drifting specks and threads swim across the view, clearest against bright areas. They trail behind as you look around.' },
  { id: 'glaucoma', label: 'Glaucoma', chip: 'Glaucoma', desc: 'Peripheral vision erodes in patches as a soft, foggy frame closes inward.' },
];

// the Patient Experience simulator's own overlay maths (severity s 0..1, gaze in % of the screen)
const FLOATER_SPOTS = [[12, 18, 5], [24, 38, 7], [33, 14, 4], [44, 30, 8], [18, 60, 6], [30, 74, 5], [9, 42, 4.5], [40, 52, 6.5], [52, 20, 5], [58, 44, 8], [66, 24, 4.5], [73, 52, 7], [49, 66, 6], [62, 72, 5], [78, 34, 5.5], [86, 58, 6.5], [88, 22, 4], [70, 12, 4], [22, 86, 5], [54, 86, 6], [82, 80, 5.5], [36, 90, 4.5], [16, 30, 4], [92, 44, 5]];
function simStyle(c, s, gx, gy) {
  const o = { background: 'none', filter: 'none', spots: 'none' };
  if (c === 'rp') {
    const amp = Math.min(1, s * 1.5125), clear = Math.max(3, (1 - amp) * 46 + 4);
    const edge = (0.4 + s * 0.45).toFixed(3), mid = (0.7 + s * 0.28).toFixed(3), wash = (s * 0.42).toFixed(3), dim = (s * 0.3).toFixed(3);
    const dark = `radial-gradient(circle at ${gx}% ${gy}%, rgba(0,0,0,0) ${clear}%, rgba(0,0,0,${edge}) ${clear + 6}%, rgba(0,0,0,${mid}) ${clear + 14}%, rgba(0,0,0,1) ${clear + 21}%)`;
    const washL = `radial-gradient(circle at ${gx}% ${gy}%, rgba(247,243,233,${wash}) 0%, rgba(247,243,233,${(s * 0.22).toFixed(3)}) ${(clear * 0.55).toFixed(1)}%, rgba(247,243,233,0) ${clear}%)`;
    o.background = `${washL}, ${dark}, linear-gradient(rgba(0,0,0,${dim}), rgba(0,0,0,${dim}))`;
    o.filter = `blur(${(s * 2.25).toFixed(2)}px)`;
  } else if (c === 'glaucoma') {
    const amp = Math.min(1, s * 0.52734375), clear = Math.max(2, (1 - amp) * 40 + 3);
    o.background = `radial-gradient(ellipse 64% 64% at ${gx}% ${gy}%, rgba(0,0,0,0) ${clear}%, rgba(16,14,12,0.5) ${clear + 7}%, rgba(0,0,0,0.97) ${clear + 24}%)`;
    o.filter = `blur(${(s * s * 11).toFixed(2)}px)`;
  } else if (c === 'cataracts') {
    o.background = `rgba(228,221,200,${(0.1 + s * 0.4).toFixed(3)})`;
    o.filter = `blur(${(s * 5).toFixed(2)}px) contrast(${(1 - s * 0.35).toFixed(3)}) brightness(${(1 + s * 0.18).toFixed(3)}) sepia(${(s * 0.35).toFixed(3)})`;
  } else if (c === 'amd') {
    const fog = Math.min(1, 0.45 + s * 0.85), r1 = 13 + s * 15, r2 = 28 + s * 28;
    o.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(22,19,15,${(0.98 * fog).toFixed(3)}) 0%, rgba(22,19,15,${(0.9 * fog).toFixed(3)}) ${r1}%, rgba(22,19,15,${(0.5 * fog).toFixed(3)}) ${r2}%, rgba(0,0,0,0) ${r2 + 16}%)`;
    o.filter = `blur(${(1.4 + s * 3.4).toFixed(2)}px)`;
  } else if (c === 'floaters') {
    const op = Math.min(1, s * 0.88), grow = 1 + s * 1.43;
    o.spots = FLOATER_SPOTS.map(([x, y, r0]) => { const r = r0 * grow; return `radial-gradient(circle at ${x}% ${y}%, rgba(6,5,3,${op.toFixed(2)}) 0%, rgba(6,5,3,${(op * 0.78).toFixed(2)}) ${(r * 0.45).toFixed(1)}%, rgba(0,0,0,0) ${r.toFixed(1)}%)`; }).join(',');
    o.filter = `blur(${(s * 3).toFixed(2)}px)`;
  }
  return o;
}

// a floor spot: red ring with the words running round it and an eye in the middle (drawn, no image files)
function spotTexture(label) {
  const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d'), m = S / 2;
  c.fillStyle = 'rgba(29,28,27,0.88)'; c.beginPath(); c.arc(m, m, 500, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#ec3013'; c.lineWidth = 34; c.beginPath(); c.arc(m, m, 470, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#f3f2f2'; c.lineWidth = 6; c.beginPath(); c.arc(m, m, 330, 0, Math.PI * 2); c.stroke();
  // text round the ring
  const text = (' ' + label + ' ·').repeat(2).toUpperCase(); c.fillStyle = '#f3f2f2'; c.font = '800 54px Archivo, Arimo, Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const total = [...text].reduce((a, ch) => a + c.measureText(ch).width, 0), R = 398, scale = (Math.PI * 2 * R * 0.97) / total;
  let ang = -Math.PI / 2;
  for (const ch of text) { const w = c.measureText(ch).width * scale; ang += w / R / 2; c.save(); c.translate(m + Math.cos(ang) * R, m + Math.sin(ang) * R); c.rotate(ang + Math.PI / 2); c.fillText(ch, 0, 0); c.restore(); ang += w / R / 2; }
  // the eye
  c.strokeStyle = '#f3f2f2'; c.lineWidth = 22; c.beginPath(); c.moveTo(m - 210, m); c.quadraticCurveTo(m, m - 190, m + 210, m); c.quadraticCurveTo(m, m + 190, m - 210, m); c.stroke();
  c.fillStyle = '#ec3013'; c.beginPath(); c.arc(m, m, 70, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1d1c1b'; c.beginPath(); c.arc(m, m, 30, 0, Math.PI * 2); c.fill();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildVisionSpots({ scene, spots, groundAt }) {
  const tex = spotTexture('See through their eyes');
  const out = [];
  for (const sp of spots) {
    const y = groundAt(sp.x, sp.y + 1, sp.z); const yy = y > -100 ? y : sp.y;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    disc.rotation.x = -Math.PI / 2; disc.rotation.z = sp.textYaw || 0; disc.position.set(sp.x, yy + 0.015, sp.z); disc.renderOrder = 2; scene.add(disc);
    const glow = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.3, 64), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.5, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.set(sp.x, yy + 0.012, sp.z); scene.add(glow);
    out.push({ ...sp, y: yy, disc, glow, pos: new THREE.Vector3(sp.x, yy, sp.z), r: 1.1 });
  }
  return out;
}

// the overlay + controls, laid over the 3D view
export function visionOverlay({ container, onExit = () => {}, onGuided = () => {} }) {
  const css = document.createElement('style');
  css.textContent = `
  #vsim{position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s}
  #vsim .vb{position:absolute;inset:0}
  #vsim .vf{position:absolute;inset:-12%;will-change:transform}
  #vsimUI{position:fixed;left:0;right:0;top:0;z-index:12;display:none;background:rgba(20,19,18,.9);color:#f3f2f2;font:400 13px/1.35 Archivo,Arimo,Helvetica,Arial,sans-serif;border-bottom:2px solid #ec3013;padding:calc(8px + env(safe-area-inset-top)) calc(12px + env(safe-area-inset-right)) 10px calc(12px + env(safe-area-inset-left))}
  #vsimUI .k{font:800 10px/1 Archivo,Arimo,sans-serif;letter-spacing:.16em;color:#ff9783;text-transform:uppercase}
  #vsimUI .t{font:800 17px/1.15 Archivo,Arimo,sans-serif;margin:3px 0 2px}
  #vsimUI .d{color:#cfcaca;font-size:12px;max-width:70ch}
  #vsimUI .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}
  #vsimUI button{min-height:40px;padding:0 12px;background:transparent;color:#f3f2f2;border:2px solid #f3f2f2;font:800 11px/1 Archivo,Arimo,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
  #vsimUI button.on{background:#f3f2f2;color:#1d1c1b}
  #vsimUI button.x{background:#ec3013;border-color:#ec3013}
  #vsimUI label{display:flex;align-items:center;gap:10px;flex:1 1 220px;font:800 10px/1 Archivo,Arimo,sans-serif;letter-spacing:.14em;text-transform:uppercase}
  #vsimUI input[type=range]{flex:1;accent-color:#ec3013;height:32px}
  #vsimUI .hint{font-size:11px;color:#a9a4a4;margin-top:6px}
  @media (max-height:500px){#vsimUI .d,#vsimUI .hint{display:none}#vsimUI .t{font-size:14px;margin:2px 0 0}#vsimUI .row{margin-top:5px}#vsimUI button{min-height:34px}}
  @media (max-width:520px){#vsimUI .d{display:none}#vsimUI button{min-height:38px;padding:0 9px;font-size:10px}}`;
  document.head.appendChild(css);
  const ov = document.createElement('div'); ov.id = 'vsim'; ov.setAttribute('aria-hidden', 'true');
  const blurL = document.createElement('div'); blurL.className = 'vb'; const spotL = document.createElement('div'); spotL.className = 'vf';
  ov.append(blurL, spotL); container.appendChild(ov);
  const touch = matchMedia('(pointer:coarse)').matches;
  const ui = document.createElement('div'); ui.id = 'vsimUI'; ui.setAttribute('role', 'region'); ui.setAttribute('aria-label', 'Vision simulator');
  ui.innerHTML = `<div class="k">See through their eyes · vision simulator</div><div class="t" id="vsT"></div><div class="d" id="vsD"></div>
    <div class="row" id="vsChips"></div>
    <div class="row"><label for="vsSev">Severity <span id="vsP">60%</span><input id="vsSev" type="range" min="0" max="100" value="60"></label>
      <button id="vsG" aria-pressed="false">Guided look</button><button id="vsX" class="x">Step off ✕</button></div>
    <div class="hint">${touch ? 'Drag the screen or use the joystick to look around' : 'Drag or use the arrow keys to look around · Esc to step off'}</div>`;
  document.body.appendChild(ui);
  const $ = id => ui.querySelector('#' + id);
  const live = document.createElement('div'); live.setAttribute('aria-live', 'polite'); live.style.cssText = 'position:absolute;left:-9999px'; document.body.appendChild(live);
  const st = { t0: 0, on: false, cond: 'rp', sev: 0.6, shown: 0, gx: 50, gy: 50, lead: [0, 0], lag: [0, 0], lagV: [0, 0], t: 0, guided: false };
  CONDITIONS.forEach(c => { const b = document.createElement('button'); b.textContent = c.chip; b.dataset.c = c.id; b.onclick = () => setCond(c.id); $('vsChips').appendChild(b); });
  function setCond(id) {
    st.cond = id; const c = CONDITIONS.find(x => x.id === id);
    $('vsT').textContent = c.label; $('vsD').textContent = c.desc;
    ui.querySelectorAll('#vsChips button').forEach(b => { b.classList.toggle('on', b.dataset.c === id); b.setAttribute('aria-pressed', b.dataset.c === id); });
    live.textContent = c.label + '. ' + c.desc;
  }
  $('vsSev').oninput = e => { st.sev = e.target.value / 100; $('vsP').textContent = e.target.value + '%'; };
  $('vsX').onclick = () => onExit();
  $('vsG').onclick = () => { st.guided = !st.guided; $('vsG').classList.toggle('on', st.guided); $('vsG').setAttribute('aria-pressed', st.guided); onGuided(st.guided); };
  setCond('rp');
  return {
    st,
    open(cond) {
      st.on = true; st.shown = 0; st.t0 = st.t; if (cond) setCond(cond); ui.style.display = 'block'; ov.style.opacity = 1;
      live.textContent = 'Vision simulator on. ' + CONDITIONS.find(x => x.id === st.cond).label + '. ' + (touch ? 'Drag to look around.' : 'Drag or use the arrow keys to look around. Press Escape to step off.');
    },
    close() { st.on = false; ui.style.display = 'none'; st.guided = false; $('vsG').classList.remove('on'); live.textContent = 'Vision simulator off.'; },
    setGuided(v) { st.guided = v; $('vsG').classList.toggle('on', v); },
    // dt seconds; yawRate/pitchRate: how fast the view is turning (rad/s)
    update(dt, yawRate, pitchRate) {
      st.t += dt;
      // sight settles in over ~2.5 s when you step on, clears over ~1 s when you step off
      const target = st.on ? st.sev : 0, rate = !st.on ? 0.9 : st.t - st.t0 < 2.6 ? 0.42 : 3;
      st.shown += THREE.MathUtils.clamp(target - st.shown, -rate * dt, rate * dt);
      if (!st.on && st.shown <= 0.001) { ov.style.opacity = 0; blurL.style.background = 'none'; blurL.style.backdropFilter = blurL.style.webkitBackdropFilter = 'none'; spotL.style.background = 'none'; return; }
      // eyes lead the turn a little (saccade), then settle back to the centre
      const lx = THREE.MathUtils.clamp(-yawRate * 7, -14, 14), ly = THREE.MathUtils.clamp(pitchRate * 6, -10, 10);
      st.lead[0] += (lx - st.lead[0]) * Math.min(1, dt * 6); st.lead[1] += (ly - st.lead[1]) * Math.min(1, dt * 6);
      st.gx = 50 + st.lead[0] + Math.sin(st.t / 0.68) * 0.7; st.gy = 48 + st.lead[1] + Math.cos(st.t / 0.91) * 0.7;
      const S = simStyle(st.cond, Math.max(0, st.shown), st.gx.toFixed(1), st.gy.toFixed(1));
      blurL.style.background = S.background; blurL.style.backdropFilter = blurL.style.webkitBackdropFilter = S.filter;
      spotL.style.background = S.spots;
      // floaters: dragged along by eye movement, then they drift back (spring), plus a slow wander
      const k = 18, damp = 3.2;
      st.lagV[0] += (-st.lag[0] * k - st.lagV[0] * damp + yawRate * 60) * dt; st.lagV[1] += (-st.lag[1] * k - st.lagV[1] * damp - pitchRate * 50) * dt;
      st.lag[0] += st.lagV[0] * dt; st.lag[1] += st.lagV[1] * dt;
      const wx = Math.sin(st.t / 3.1) * 1.6 + st.lag[0], wy = Math.cos(st.t / 4.3) * 1.2 + st.lag[1];
      spotL.style.transform = `translate(${THREE.MathUtils.clamp(wx, -9, 9).toFixed(2)}%, ${THREE.MathUtils.clamp(wy, -9, 9).toFixed(2)}%)`;
    },
  };
}
