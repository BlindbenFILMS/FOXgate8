// THE ONLY LIGHT WE'LL SEE: the eight things hidden in the night, drawn as moonlit shapes (dark blue, lit in silver
// from above, with a soft rim of moonlight) instead of emoji, so they're big, clear and the same on every phone.
// Each one moves a little, gently: the owl turns its head, the canoe rocks, fireflies drift and blink, the deer
// lifts its head, the fish jumps, the lantern sways and flickers, the heron breathes, the loon bobs on the water.
// thing(id, size) → { group, opacity(v), tick(t, dt) }: put the group at the thing's spot; size is its width (board units).
import * as THREE from 'three';
import * as K from './kit.js';

const S = 256;
// moonlit fill: pale silver where the moon catches it, deep blue below
function moon(g, y0 = 0, y1 = S) { const f = g.createLinearGradient(0, y0, 0, y1); f.addColorStop(0, '#d6e2fa'); f.addColorStop(0.35, '#8295bd'); f.addColorStop(1, '#2c3a5c'); return f; }
// draw a shape twice: a soft glow of moonlight behind it, then the shape itself with a fine silver edge
function lit(g, path, { fill, y0, y1, edge = 3 } = {}) {
  g.save(); g.filter = 'blur(6px)'; g.globalAlpha = 0.55; g.fillStyle = '#bcd0ff'; path(g); g.fill(); g.restore();
  g.fillStyle = fill || moon(g, y0, y1); path(g); g.fill();
  g.strokeStyle = 'rgba(235,242,255,.9)'; g.lineWidth = edge; g.lineJoin = 'round'; g.lineCap = 'round'; path(g); g.stroke();
}
const tex = draw => K.canvasTex(S, S, g => draw(g));

const DRAW = {
  owl: g => {
    // the branch
    g.strokeStyle = '#3a3226'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(20, 214); g.quadraticCurveTo(128, 200, 238, 222); g.stroke();
    g.strokeStyle = 'rgba(220,230,255,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(24, 208); g.quadraticCurveTo(128, 194, 234, 216); g.stroke();
    lit(g, p => { p.beginPath(); p.moveTo(128, 70); p.bezierCurveTo(196, 70, 196, 210, 128, 212); p.bezierCurveTo(60, 210, 60, 70, 128, 70); p.closePath(); }, { y0: 60, y1: 212 });
    // wing lines and breast feathers
    g.strokeStyle = 'rgba(30,40,70,.6)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(84, 120); g.quadraticCurveTo(92, 180, 116, 204); g.moveTo(172, 120); g.quadraticCurveTo(164, 180, 140, 204); g.stroke();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3 - (r % 2); c++) { g.beginPath(); g.arc(112 + c * 16 + (r % 2) * 8, 150 + r * 16, 6, 0.2, Math.PI - 0.2); g.stroke(); }
    // feet on the branch
    g.strokeStyle = '#e8d9a8'; g.lineWidth = 4; for (const x of [112, 144]) { g.beginPath(); g.moveTo(x - 7, 214); g.lineTo(x, 206); g.lineTo(x + 7, 214); g.stroke(); }
  },
  // the owl's head: drawn on its own so it can turn
  owlHead: g => {
    lit(g, p => { p.beginPath(); p.moveTo(70, 150); p.lineTo(62, 70); p.lineTo(98, 104); p.quadraticCurveTo(128, 92, 158, 104); p.lineTo(194, 70); p.lineTo(186, 150); p.bezierCurveTo(186, 210, 70, 210, 70, 150); p.closePath(); }, { y0: 70, y1: 200 });
    for (const x of [102, 154]) {
      g.fillStyle = 'rgba(220,230,255,.35)'; g.beginPath(); g.arc(x, 146, 26, 0, Math.PI * 2); g.fill();
      const e = g.createRadialGradient(x, 146, 2, x, 146, 18); e.addColorStop(0, '#fff6c4'); e.addColorStop(1, '#e0a83a'); g.fillStyle = e; g.beginPath(); g.arc(x, 146, 18, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#10131c'; g.beginPath(); g.arc(x, 146, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 4, 142, 3, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#d8b46a'; g.beginPath(); g.moveTo(120, 162); g.lineTo(136, 162); g.lineTo(128, 184); g.closePath(); g.fill();
  },
  canoe: g => {
    // the paddler
    lit(g, p => { p.beginPath(); p.arc(132, 88, 16, 0, Math.PI * 2); }, { y0: 70, y1: 110 });
    lit(g, p => { p.beginPath(); p.moveTo(112, 158); p.quadraticCurveTo(110, 110, 132, 106); p.quadraticCurveTo(156, 110, 154, 158); p.closePath(); }, { y0: 100, y1: 160 });
    // the paddle
    g.strokeStyle = '#c9a36a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(176, 96); g.lineTo(206, 196); g.stroke();
    g.fillStyle = '#c9a36a'; g.beginPath(); g.ellipse(210, 206, 9, 20, -0.3, 0, Math.PI * 2); g.fill();
    // the hull
    const f = g.createLinearGradient(0, 150, 0, 196); f.addColorStop(0, '#b98a5a'); f.addColorStop(1, '#4a3424');
    lit(g, p => { p.beginPath(); p.moveTo(14, 146); p.quadraticCurveTo(60, 158, 128, 158); p.quadraticCurveTo(196, 158, 242, 146); p.quadraticCurveTo(214, 196, 128, 196); p.quadraticCurveTo(42, 196, 14, 146); p.closePath(); }, { fill: f });
    g.strokeStyle = 'rgba(255,240,210,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(24, 152); g.quadraticCurveTo(128, 166, 232, 152); g.stroke();
    // its reflection ripples
    g.strokeStyle = 'rgba(200,215,255,.45)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(40 + i * 16, 212 + i * 12); g.lineTo(216 - i * 16, 212 + i * 12); g.stroke(); }
  },
  grass: g => {
    // a tuft of tall grass the fireflies hover over
    for (let i = 0; i < 26; i++) {
      const x = 30 + i * 7.6 + Math.sin(i * 7) * 4, h = 60 + (i * 37 % 50), b = Math.sin(i * 3) * 18;
      g.strokeStyle = i % 3 ? '#3b4f4a' : '#5a7368'; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, 236); g.quadraticCurveTo(x + b * 0.4, 236 - h * 0.6, x + b, 236 - h); g.stroke();
    }
    g.strokeStyle = 'rgba(220,235,255,.35)'; g.lineWidth = 2; for (let i = 0; i < 26; i += 2) { const x = 30 + i * 7.6, h = 60 + (i * 37 % 50), b = Math.sin(i * 3) * 18; g.beginPath(); g.moveTo(x + b * 0.6, 236 - h * 0.8); g.lineTo(x + b, 236 - h); g.stroke(); }
  },
  deer: g => {
    // legs, body, tail: the head is its own piece so it can lift and look
    g.strokeStyle = '#3d3a4a'; g.lineWidth = 9; g.lineCap = 'round';
    for (const [x0, x1] of [[78, 72], [96, 98], [164, 160], [182, 188]]) { g.beginPath(); g.moveTo(x0, 150); g.lineTo(x1, 228); g.stroke(); }
    lit(g, p => { p.beginPath(); p.moveTo(64, 130); p.bezierCurveTo(70, 96, 190, 92, 200, 120); p.bezierCurveTo(206, 150, 180, 164, 130, 164); p.bezierCurveTo(80, 164, 60, 156, 64, 130); p.closePath(); }, { fill: (() => { const f = g.createLinearGradient(0, 96, 0, 166); f.addColorStop(0, '#d9c8b0'); f.addColorStop(0.4, '#8c7660'); f.addColorStop(1, '#3a3040'); return f; })() });
    g.fillStyle = '#f2ece2'; g.beginPath(); g.ellipse(62, 124, 8, 12, 0.3, 0, Math.PI * 2); g.fill();
    // neck
    lit(g, p => { p.beginPath(); p.moveTo(176, 118); p.lineTo(194, 64); p.lineTo(214, 70); p.lineTo(200, 132); p.closePath(); }, { fill: '#8c7660' });
  },
  deerHead: g => {
    // antlers
    g.strokeStyle = '#e8dcc0'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128 + s * 10, 104); g.lineTo(128 + s * 28, 60); g.lineTo(128 + s * 50, 36); g.moveTo(128 + s * 26, 66); g.lineTo(128 + s * 10, 40); g.moveTo(128 + s * 38, 50); g.lineTo(128 + s * 54, 58); g.stroke(); }
    // ears
    lit(g, p => { p.beginPath(); p.ellipse(92, 118, 22, 10, -0.4, 0, Math.PI * 2); p.moveTo(186, 118); p.ellipse(164, 118, 22, 10, 0.4, 0, Math.PI * 2); }, { fill: '#a48c74' });
    // head and muzzle
    lit(g, p => { p.beginPath(); p.moveTo(104, 112); p.quadraticCurveTo(128, 96, 152, 112); p.quadraticCurveTo(150, 160, 136, 182); p.quadraticCurveTo(128, 190, 120, 182); p.quadraticCurveTo(106, 160, 104, 112); p.closePath(); }, { fill: (() => { const f = g.createLinearGradient(0, 100, 0, 190); f.addColorStop(0, '#dcc9ae'); f.addColorStop(1, '#6e5a4a'); return f; })() });
    g.fillStyle = '#14141c'; for (const x of [114, 142]) { g.beginPath(); g.arc(x, 132, 5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#fff'; for (const x of [112, 140]) { g.beginPath(); g.arc(x, 130, 1.8, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#20202a'; g.beginPath(); g.ellipse(128, 180, 8, 5, 0, 0, Math.PI * 2); g.fill();
  },
  fish: g => {
    const f = g.createLinearGradient(0, 90, 0, 170); f.addColorStop(0, '#e8f0ff'); f.addColorStop(0.45, '#8ea6cf'); f.addColorStop(1, '#3a4c74');
    lit(g, p => { p.beginPath(); p.moveTo(40, 128); p.bezierCurveTo(80, 76, 160, 80, 196, 128); p.bezierCurveTo(160, 176, 80, 180, 40, 128); p.closePath(); }, { fill: f });
    lit(g, p => { p.beginPath(); p.moveTo(190, 128); p.lineTo(238, 92); p.quadraticCurveTo(226, 128, 238, 164); p.closePath(); }, { fill: '#7f95c0' });
    lit(g, p => { p.beginPath(); p.moveTo(100, 92); p.quadraticCurveTo(124, 64, 150, 92); p.closePath(); }, { fill: '#7f95c0' });
    // scales shimmer, gill, eye
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { g.beginPath(); g.arc(96 + c * 18 + (r % 2) * 9, 112 + r * 14, 8, -1.2, 1.2); g.stroke(); }
    g.strokeStyle = 'rgba(30,40,70,.6)'; g.lineWidth = 4; g.beginPath(); g.arc(80, 128, 22, -1, 1); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(62, 120, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#10131c'; g.beginPath(); g.arc(62, 120, 4.5, 0, Math.PI * 2); g.fill();
  },
  splash: g => {
    // drops and a ring on the water, shown as the fish leaps
    g.strokeStyle = 'rgba(220,232,255,.85)'; g.lineWidth = 5; g.beginPath(); g.ellipse(128, 200, 80, 18, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.ellipse(128, 200, 112, 26, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#e8f0ff'; for (const [x, y, r] of [[80, 160, 7], [104, 140, 5], [150, 136, 6], [176, 158, 7], [128, 124, 5]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  },
  lantern: g => {
    // the hook it hangs from (the sprite swings around its top)
    g.strokeStyle = '#2a2a33'; g.lineWidth = 5; g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 40); g.stroke();
    g.beginPath(); g.arc(128, 50, 12, Math.PI, 0); g.stroke();
    // cap and base
    lit(g, p => { p.beginPath(); p.moveTo(84, 82); p.lineTo(128, 52); p.lineTo(172, 82); p.closePath(); }, { fill: '#3c3a46' });
    lit(g, p => { p.beginPath(); p.rect(90, 208, 76, 14); }, { fill: '#3c3a46' });
    // the glass, glowing warm
    const w = g.createRadialGradient(128, 146, 6, 128, 146, 70); w.addColorStop(0, '#fffbe0'); w.addColorStop(0.35, '#ffd27a'); w.addColorStop(1, '#c46a1e');
    g.fillStyle = w; g.fillRect(94, 84, 68, 124);
    // the frame
    g.strokeStyle = '#2a2a33'; g.lineWidth = 6; g.strokeRect(94, 84, 68, 124); g.beginPath(); g.moveTo(128, 84); g.lineTo(128, 208); g.moveTo(94, 146); g.lineTo(162, 146); g.stroke();
    g.strokeStyle = 'rgba(255,240,200,.7)'; g.lineWidth = 2; g.strokeRect(91, 81, 74, 130);
  },
  heron: g => {
    // legs in the shallows
    g.strokeStyle = '#2e3446'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(118, 170); g.lineTo(112, 236); g.moveTo(134, 170); g.lineTo(144, 236); g.stroke();
    // body
    lit(g, p => { p.beginPath(); p.moveTo(70, 150); p.bezierCurveTo(90, 108, 160, 108, 170, 140); p.bezierCurveTo(176, 170, 120, 182, 70, 150); p.closePath(); }, { y0: 108, y1: 182 });
    g.strokeStyle = 'rgba(30,40,70,.55)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(84 + i * 10, 148 + i); g.quadraticCurveTo(110 + i * 8, 160, 150, 154); g.stroke(); }
    // the s-shaped neck, head, black crest and long beak
    lit(g, p => { p.beginPath(); p.moveTo(150, 124); p.bezierCurveTo(186, 110, 150, 80, 164, 50); p.lineTo(176, 54); p.bezierCurveTo(166, 84, 196, 118, 160, 138); p.closePath(); }, { y0: 46, y1: 138, edge: 2.5 });
    lit(g, p => { p.beginPath(); p.ellipse(172, 46, 15, 11, 0, 0, Math.PI * 2); }, { y0: 34, y1: 58 });
    g.strokeStyle = '#1a1e2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(166, 40); g.quadraticCurveTo(146, 36, 132, 46); g.stroke();
    g.fillStyle = '#e6c56a'; g.beginPath(); g.moveTo(184, 42); g.lineTo(236, 52); g.lineTo(184, 52); g.closePath(); g.fill();
    g.fillStyle = '#10131c'; g.beginPath(); g.arc(176, 44, 3, 0, Math.PI * 2); g.fill();
    // ripples round its feet
    g.strokeStyle = 'rgba(200,215,255,.5)'; g.lineWidth = 3; for (const x of [112, 144]) { g.beginPath(); g.ellipse(x, 238, 20, 5, 0, 0, Math.PI * 2); g.stroke(); }
  },
  loon: g => {
    // body low on the water
    const f = g.createLinearGradient(0, 120, 0, 190); f.addColorStop(0, '#5a6a8e'); f.addColorStop(1, '#141a2c');
    lit(g, p => { p.beginPath(); p.moveTo(32, 170); p.bezierCurveTo(40, 130, 150, 124, 186, 150); p.lineTo(200, 172); p.bezierCurveTo(140, 186, 70, 186, 32, 170); p.closePath(); }, { fill: f });
    // the loon's white checkered back
    g.fillStyle = 'rgba(240,246,255,.85)'; for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { g.fillRect(62 + c * 14 + (r % 2) * 7, 142 + r * 9, 5, 4); }
    // neck and head
    lit(g, p => { p.beginPath(); p.moveTo(160, 152); p.quadraticCurveTo(162, 104, 184, 92); p.quadraticCurveTo(214, 84, 214, 108); p.quadraticCurveTo(196, 116, 192, 156); p.closePath(); }, { fill: '#1c2236' });
    // the white necklace, the red eye, the dagger beak
    g.strokeStyle = 'rgba(240,246,255,.9)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(166 + i * 3, 126 + i * 4); g.lineTo(192, 124 + i * 4); g.stroke(); }
    g.fillStyle = '#e04848'; g.beginPath(); g.arc(200, 100, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a2e3a'; g.beginPath(); g.moveTo(210, 100); g.lineTo(246, 108); g.lineTo(212, 112); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(220,230,255,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(212, 101); g.lineTo(244, 107); g.stroke();
  },
  ripple: g => { g.strokeStyle = 'rgba(220,232,255,.9)'; g.lineWidth = 5; g.beginPath(); g.ellipse(128, 128, 118, 30, 0, 0, Math.PI * 2); g.stroke(); },
};
const TEX = {};
const T = k => TEX[k] || (TEX[k] = tex(DRAW[k]));

export function thing(id, size) {
  const group = new THREE.Group(), parts = [];
  const add = (key, s, x = 0, y = 0, { order = 20, additive = false, center, color } = {}) => {
    const sp = K.sprite(key === 'glow' ? K.glowTex : key === 'dot' ? K.dotTex : T(key), s, { order, additive, color, opacity: 0 });
    if (center) sp.center.set(...center); sp.position.set(x, y, 0); group.add(sp); parts.push({ sp, base: 1 }); return sp;
  };
  let tick = () => {};
  const u = size;   // everything is placed in units of the thing's size
  if (id === 'owl') {
    const body = add('owl', u), head = add('owlHead', u * 0.62, 0, u * 0.26, { order: 21 });
    let blink = 3;
    tick = (t, dt) => {
      // turns its head to look around, now and then, and breathes
      const look = Math.sin(t * 0.7) * 0.5 + Math.sin(t * 0.23) * 0.5;
      head.material.rotation = look * 0.22; head.position.x = look * u * 0.03;
      body.scale.set(u, u * (1 + Math.sin(t * 1.6) * 0.012), 1);
      blink -= dt; head.scale.set(u * 0.62, u * 0.62 * (blink < 0.12 ? 0.9 : 1), 1); if (blink < 0) blink = 2.5 + Math.random() * 3;
    };
  } else if (id === 'canoe') {
    const boat = add('canoe', u);
    tick = t => { boat.material.rotation = Math.sin(t * 0.9) * 0.05; boat.position.x = Math.sin(t * 0.25) * u * 0.08; boat.position.y = Math.sin(t * 1.3) * u * 0.015; };
  } else if (id === 'fireflies') {
    add('grass', u, 0, -u * 0.08);
    const flies = [];
    for (let i = 0; i < 9; i++) {
      const g = add('glow', u * 0.2, 0, 0, { order: 22, additive: true, color: '#e8ff8a' }), c = add('dot', u * 0.06, 0, 0, { order: 23, color: '#fffbd0' });
      flies.push({ g, c, a: Math.random() * 6.28, r: 0.15 + Math.random() * 0.25, sp: 0.3 + Math.random() * 0.5, ph: Math.random() * 6.28, h: Math.random() * 0.3 });
    }
    tick = t => {
      for (const f of flies) {
        // each drifts in a slow loop and blinks on and off
        const x = Math.cos(f.a + t * f.sp) * f.r * u, y = (-0.02 + f.h) * u + Math.sin(f.a * 2 + t * f.sp * 1.7) * 0.12 * u;
        f.g.position.set(x, y, 0.001); f.c.position.set(x, y, 0.002);
        const on = Math.max(0, Math.sin(t * 1.4 + f.ph)); f.g.userData.k = on; f.c.userData.k = 0.3 + on * 0.7;
      }
    };
  } else if (id === 'deer') {
    const body = add('deer', u), head = add('deerHead', u * 0.5, u * 0.31, u * 0.22, { order: 21, center: [0.5, 0.32] });
    tick = t => {
      // lifts its head, listens, and lowers it again; the ears flick
      const up = 0.5 + 0.5 * Math.sin(t * 0.45);
      head.position.y = u * (0.2 + up * 0.04); head.material.rotation = (1 - up) * -0.25 + Math.sin(t * 3.1) * 0.02 * up;
      body.scale.set(u, u * (1 + Math.sin(t * 1.4) * 0.01), 1);
    };
  } else if (id === 'fish') {
    const fish = add('fish', u * 0.8, 0, 0, { order: 21 }), splash = add('splash', u * 1.1, 0, -u * 0.18);
    let jt = 1.5;
    tick = (t, dt) => {
      // swims a little at the surface, then leaps in an arc and dives back with a splash
      jt -= dt; if (jt < -1.4) jt = 2.6 + Math.random() * 1.5;
      if (jt < 0) { const k = -jt / 1.4; fish.position.set((k - 0.5) * u * 0.7, Math.sin(k * Math.PI) * u * 0.55 - u * 0.05, 0); fish.material.rotation = 0.9 - k * 1.8; fish.userData.k = 1; splash.userData.k = k < 0.2 ? 1 - k * 5 : k > 0.8 ? (k - 0.8) * 5 : 0; }
      else { fish.position.set(Math.sin(t * 1.2) * u * 0.08, -u * 0.05 + Math.sin(t * 2.4) * u * 0.02, 0); fish.material.rotation = Math.sin(t * 2.4) * 0.08; fish.userData.k = 0.85; splash.userData.k = 0; }
    };
  } else if (id === 'lantern') {
    const glow = add('glow', u * 2.4, 0, -u * 0.08, { order: 19, additive: true, color: '#ffb54a' }), lamp = add('lantern', u, 0, u * 0.5, { order: 21, center: [0.5, 1] });
    tick = t => {
      // sways gently on its hook, and its flame flickers
      lamp.material.rotation = Math.sin(t * 1.1) * 0.09;
      const fl = 0.75 + 0.15 * Math.sin(t * 9.3) + 0.1 * Math.sin(t * 13.7 + 1);
      glow.userData.k = fl * 0.55; glow.position.x = Math.sin(t * 1.1) * -u * 0.08;
    };
  } else if (id === 'heron') {
    const bird = add('heron', u, 0, 0, { center: [0.5, 0.08] });
    bird.position.y = -u * 0.42;
    tick = t => {
      // stands still and patient, breathing, leaning in now and then as if watching for a fish
      const lean = Math.max(0, Math.sin(t * 0.35)) ** 3;
      bird.material.rotation = -lean * 0.08 + Math.sin(t * 1.5) * 0.01;
      bird.scale.set(u, u * (1 + Math.sin(t * 1.5) * 0.012), 1);
    };
  } else if (id === 'loon') {
    const r1 = add('ripple', u, 0, -u * 0.18), r2 = add('ripple', u, 0, -u * 0.18), bird = add('loon', u, 0, 0, { order: 21 });
    tick = t => {
      // bobs on the water, drifting a little, with rings spreading out around it
      bird.position.y = Math.sin(t * 1.6) * u * 0.025; bird.material.rotation = Math.sin(t * 1.6 + 0.6) * 0.04; bird.position.x = Math.sin(t * 0.3) * u * 0.06;
      for (const [r, o] of [[r1, 0], [r2, 0.5]]) { const k = (t * 0.4 + o) % 1; r.scale.set(u * (0.8 + k * 0.9), u * (0.8 + k * 0.9), 1); r.position.x = bird.position.x; r.userData.k = (1 - k) * 0.6; }
    };
  }
  let op = 0;
  return {
    group,
    opacity(v) { op = v; },
    tick(t, dt) {
      tick(t, dt);
      for (const p of parts) { const k = p.sp.userData.k == null ? 1 : p.sp.userData.k; p.sp.material.opacity = op * k; }
    },
  };
}
