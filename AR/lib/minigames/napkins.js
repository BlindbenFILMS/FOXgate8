// NAPKIN PLEASE: a mini game inside Wayne Pearcy's painting.
// Press Play and the painted napkin tower vanishes (an "empty" copy of the painting with the tower painted out
// is laid exactly over the art). Then Wayne starts stacking napkins again, faster and faster. Swipe napkins off
// the tower before it reaches the top of the frame, or it's a napkin avalanche.
// Accessible by ear: every new napkin goes "fwip" a little higher as the tower grows, a heartbeat starts when it
// gets close to the top, and a swipe anywhere flings the top napkin.
//
// Game API (used by AR/index.html, see lib/minigames/index.js):
//   start({ group, h, camera, renderer, say, buzz }) · update(dt) · pointer(kind, event) · pause() · resume() · stop()
import * as THREE from 'three';

const EMPTY = 'media/games/napkin-please-empty.jpg';
// in painting units (1 wide, centred): the tower stands on the diner's head and is as wide as the painted one
const BASE_Y = 0.5 - 790 / 1024, TOWER_X = 540 / 1024 - 0.5, STEP = 0.031, NW = 0.30, NH = 0.075;
const HAND = [500 / 1024 - 0.5, 0.5 - 445 / 1024];   // Wayne's hands, where new napkins come from

/* napkins drawn in the painting's palette: a folded cloth seen from the side, light on top, a drooping corner */
function napkinTexture(seed) {
  const W = 256, H = 64, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  let s = seed * 9301 + 49297; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const droopL = 6 + r() * 16, droopR = 6 + r() * 16, flap = r() < 0.5 ? -1 : 1;
  // body
  g.beginPath(); g.moveTo(4, 18); g.quadraticCurveTo(W / 2, 8 + r() * 6, W - 4, 16);
  g.lineTo(W - 2, 30 + droopR); g.quadraticCurveTo(W * 0.6, 42, W / 2, 40); g.quadraticCurveTo(W * 0.3, 44, 2, 30 + droopL); g.closePath();
  const grad = g.createLinearGradient(0, 8, 0, 56); grad.addColorStop(0, '#fbf6ea'); grad.addColorStop(0.45, '#ece4d3'); grad.addColorStop(1, '#b9b1a6');
  g.fillStyle = grad; g.fill();
  g.strokeStyle = 'rgba(110,100,92,.55)'; g.lineWidth = 1.5; g.stroke();
  // folds
  g.strokeStyle = 'rgba(150,140,128,.6)'; g.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const x = 30 + r() * (W - 60); g.beginPath(); g.moveTo(x, 14 + r() * 6); g.quadraticCurveTo(x + 10, 26, x + (r() - 0.5) * 20, 38); g.stroke(); }
  // a corner flap hanging over the edge
  const fx = flap < 0 ? 40 + r() * 40 : W - 80 - r() * 40;
  const tip = fx + 16 + r() * 16;
  g.beginPath(); g.moveTo(fx, 33); g.quadraticCurveTo(fx + 24, 38, fx + 44, 34); g.quadraticCurveTo(fx + 40, 48, tip, 56); g.quadraticCurveTo(fx + 8, 48, fx, 33); g.closePath();
  const fg = g.createLinearGradient(0, 34, 0, 60); fg.addColorStop(0, '#f3ecdd'); fg.addColorStop(1, '#a9a197'); g.fillStyle = fg; g.fill();
  g.strokeStyle = 'rgba(110,100,92,.5)'; g.lineWidth = 1.2; g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

let ac = null;
function audio() { if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
function swish(freq, dur, vol) {           // filtered noise: cloth sounds
  const a = audio(); if (!a) return;
  const n = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) { const k = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * k) * (1 - k * 0.4); }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = n; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.4; g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start();
}
function beep(freq, dur, vol, type = 'sine', delay = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}

export function napkinsGame() {
  let G = null;                                     // everything for one round
  const textures = Array.from({ length: 6 }, (_, i) => napkinTexture(i + 1));
  const geo = new THREE.PlaneGeometry(NW, NH);
  let emptyTex = null;
  const best = (() => { try { return +localStorage.getItem('napkins-best') || 0; } catch (e) { return 0; } })();
  let bestScore = best;

  function hud() {
    let el = document.getElementById('mgHud');
    if (!el) {
      el = document.createElement('div'); el.id = 'mgHud'; el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:calc(10px + env(safe-area-inset-left));top:calc(68px + env(safe-area-inset-top));z-index:11;background:#000;color:#fff;' +
        'padding:8px 16px 7px;border-bottom:4px solid #ec3013;font:900 20px/1.1 Archivo,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;text-align:left;pointer-events:none;max-width:52vw';
      document.body.appendChild(el);
    }
    return el;
  }
  function big(text, sub, secs) {
    let el = document.getElementById('mgBig');
    if (!el) { el = document.createElement('div'); el.id = 'mgBig'; el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:0;right:0;top:36%;z-index:11;display:flex;justify-content:center;pointer-events:none';
      document.body.appendChild(el); }
    el.innerHTML = '<div style="background:#000;color:#fff;padding:12px 22px 11px;border-bottom:6px solid #ec3013;text-align:center;font:900 clamp(28px,9vw,52px)/1 Archivo,Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em"></div>';
    const box = el.firstChild; box.textContent = text;
    if (sub) { const s = document.createElement('small'); s.style.cssText = 'display:block;font:700 16px/1.3 Atkinson Hyperlegible,Arial,sans-serif;text-transform:none;letter-spacing:0;color:#ccc;margin-top:8px'; s.textContent = sub; box.appendChild(s); }
    el.style.display = 'flex'; if (G) G.bigT = secs || 0;
  }
  const hideBig = () => { const el = document.getElementById('mgBig'); if (el) el.style.display = 'none'; };

  function addNapkin(fromHand) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: textures[(Math.random() * textures.length) | 0], transparent: true, depthWrite: false }));
    const n = { m, ox: (Math.random() - 0.5) * 0.05, rot: (Math.random() - 0.5) * 0.12, y: 0, x: 0, fly: null, arrive: fromHand ? 0 : 1 };
    if (fromHand) { m.position.set(HAND[0], HAND[1], 0.01); }
    G.root.add(m); G.stack.push(n); return n;
  }
  function towerTop() { return BASE_Y + G.stack.length * STEP + NH / 2; }

  function layout(dt) {
    const h = G.h, sway = Math.sin(G.t * 1.7) * Math.min(0.03, G.stack.length * 0.0016);
    G.stack.forEach((n, i) => {
      const k = i / Math.max(1, G.stack.length), ty = BASE_Y + i * STEP, tx = TOWER_X + n.ox + sway * k * k * 4;
      if (n.arrive < 1) {                                  // arcing in from Wayne's hands
        n.arrive = Math.min(1, n.arrive + dt / 0.38); const e = n.arrive, s = 1 - (1 - e) * (1 - e);
        n.m.position.x = HAND[0] + (tx - HAND[0]) * s; n.m.position.y = HAND[1] + (ty - HAND[1]) * s + Math.sin(e * Math.PI) * 0.08;
        n.m.rotation.z = n.rot * e + (1 - e) * 0.6;
      } else {                                             // settle onto the stack (and drop down when napkins below are swiped)
        n.m.position.x += (tx - n.m.position.x) * Math.min(1, dt * 12);
        n.m.position.y += (ty - n.m.position.y) * Math.min(1, dt * 10);
        n.m.rotation.z += (n.rot + sway * k * 2 - n.m.rotation.z) * Math.min(1, dt * 8);
      }
      n.m.position.z = 0.01 + i * 0.0006; n.m.renderOrder = 10 + i;
    });
    for (const f of G.flying) {
      f.vy -= 1.6 * dt; f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.position.z += 0.25 * dt;
      f.m.rotation.z += f.spin * dt; f.life -= dt; f.m.material.opacity = Math.max(0, Math.min(1, f.life * 2));
    }
    G.flying = G.flying.filter(f => { if (f.life > 0) return true; G.root.remove(f.m); f.m.material.dispose(); return false; });
  }

  function fling(n, vx, vy) {
    const i = G.stack.indexOf(n); if (i < 0) return; G.stack.splice(i, 1);
    G.flying.push({ m: n.m, vx: vx + (Math.random() - 0.5) * 0.2, vy: vy + 0.3, spin: (Math.random() - 0.5) * 9, life: 1.1 });
    G.score++;
  }

  function gameOver() {
    G.over = true; G.playing = false;
    // avalanche: everything tumbles off
    for (const n of G.stack.splice(0)) G.flying.push({ m: n.m, vx: (Math.random() - 0.5) * 1.2, vy: 0.2 + Math.random() * 0.8, spin: (Math.random() - 0.5) * 12, life: 1.8 + Math.random() });
    swish(500, 1.4, 0.5); swish(260, 1.8, 0.4); G.buzz([120, 60, 120, 60, 260]);
    const rec = G.score > bestScore; if (rec) { bestScore = G.score; try { localStorage.setItem('napkins-best', String(bestScore)); } catch (e) {} }
    big('Napkin avalanche!', G.score + ' napkins swiped' + (rec ? ' · New best!' : ' · Best ' + bestScore), 4);
    hud().textContent = G.score + ' swiped' + (rec ? ' · Best!' : ' · Best ' + bestScore);
    G.say('Napkin avalanche! You swiped ' + G.score + ' napkins.' + (rec ? ' New best!' : ''));
    G.overT = 0;
  }

  /* swipes: the finger's path is projected onto the painting; any napkin it crosses flies off the way you swiped.
     A swipe that misses everything still takes the top napkin, so it can be played by sound alone. */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), hit = new THREE.Vector3(), inv = new THREE.Matrix4();
  function toBoard(ev) {
    const r = G.renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, G.camera);
    G.root.updateWorldMatrix(true, false);
    plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).transformDirection(G.root.matrixWorld), new THREE.Vector3().setFromMatrixPosition(G.root.matrixWorld));
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    inv.copy(G.root.matrixWorld).invert(); const p = hit.clone().applyMatrix4(inv); return { x: p.x, y: p.y, t: performance.now(), sx: ev.clientX, sy: ev.clientY };
  }

  return {
    title: 'Napkin Please',
    start({ group, h, camera, renderer, say, buzz }) {
      if (G) this.stop();
      audio();
      G = { group, h, camera, renderer, say, buzz, root: new THREE.Group(), stack: [], flying: [], t: 0, spawnT: 0.6, score: 0, playing: false, over: false, bigT: 0, beatT: 0, path: null, countdown: 1.6, paused: false };
      group.add(G.root);
      // the painting without its tower, laid exactly over the art
      if (!emptyTex) { emptyTex = new THREE.TextureLoader().load(EMPTY); emptyTex.colorSpace = THREE.SRGBColorSpace; }
      G.empty = new THREE.Mesh(new THREE.PlaneGeometry(1, h), new THREE.MeshBasicMaterial({ map: emptyTex, transparent: true, opacity: 0 }));
      G.empty.position.z = 0.004; G.empty.renderOrder = 5; G.root.add(G.empty);
      // a few napkins already on the table, so the tower "falls apart" into the game
      for (let i = 0; i < 4; i++) { const n = addNapkin(false); n.m.position.set(TOWER_X + n.ox, BASE_Y + i * STEP, 0.01); }
      hud().textContent = 'Swipe the napkins!'; hud().style.display = 'block';
      big('Napkin please!', 'Swipe napkins off the tower before it reaches the top', 2.2);
      say('Napkin please! Wayne is stacking napkins. Swipe them away before the tower reaches the top of the frame. Swipe anywhere to take the top napkin.');
      buzz(40);
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt;
      if (G.empty.material.opacity < 1) G.empty.material.opacity = Math.min(1, G.empty.material.opacity + dt * 2.5);
      if (G.bigT > 0) { G.bigT -= dt; if (G.bigT <= 0) hideBig(); }
      if (G.countdown > 0) { G.countdown -= dt; if (G.countdown <= 0) { G.playing = true; G.t0 = G.t; } }
      if (G.playing) {
        const play = G.t - G.t0, interval = Math.max(0.32, 1.05 - play * 0.012);
        G.spawnT -= dt;
        if (G.spawnT <= 0) {
          G.spawnT = interval * (0.8 + Math.random() * 0.4);
          addNapkin(true);
          const frac = (towerTop() - BASE_Y) / (G.h / 2 - BASE_Y);
          swish(700 + frac * 1600, 0.18, 0.28);                 // higher as the tower grows
        }
        const frac = (towerTop() - BASE_Y) / (G.h / 2 - BASE_Y);
        if (frac > 0.72) { G.beatT -= dt; if (G.beatT <= 0) { beep(70, 0.12, 0.35, 'sine'); beep(62, 0.12, 0.3, 'sine', 0.16); G.buzz(30); G.beatT = 0.9 - (frac - 0.72) * 2; } }
        hud().textContent = G.score + ' swiped' + (frac > 0.72 ? ' · Careful!' : '');
        if (towerTop() > G.h / 2 - 0.01) gameOver();
      }
      if (G.over) { G.overT += dt; if (G.overT > 2.5 && G.empty.material.opacity > 0) G.empty.material.opacity = Math.max(0, G.empty.material.opacity - dt * 1.5); }
      layout(dt);
    },
    pointer(kind, ev) {
      if (!G || G.paused) return;
      if (kind === 'down') { const p = toBoard(ev); G.path = p ? [p] : null; return; }
      if (!G.path) return;
      const p = toBoard(ev); if (p) G.path.push(p);
      if (kind !== 'up') return;
      const path = G.path; G.path = null;
      if (!G.playing || path.length < 2) return;
      const a = path[0], b = path[path.length - 1], px = Math.hypot(b.sx - a.sx, b.sy - a.sy); if (px < 30) return;
      const dt = Math.max(0.05, (b.t - a.t) / 1000), vx = Math.max(-3, Math.min(3, (b.x - a.x) / dt)), vy = Math.max(-3, Math.min(3, (b.y - a.y) / dt));
      // napkins the finger crossed
      const hits = new Set();
      for (let i = 1; i < path.length; i++) for (let k = 0; k <= 6; k++) {
        const x = path[i - 1].x + (path[i].x - path[i - 1].x) * k / 6, y = path[i - 1].y + (path[i].y - path[i - 1].y) * k / 6;
        for (const n of G.stack) if (n.arrive >= 1 && Math.abs(x - n.m.position.x) < NW / 2 && Math.abs(y - n.m.position.y) < STEP * 0.75) hits.add(n);
      }
      if (!hits.size && G.stack.length) hits.add(G.stack[G.stack.length - 1]);
      const n = hits.size; for (const k of hits) fling(k, vx * 0.6, vy * 0.6);
      if (n) { swish(1800, 0.22, 0.35); beep(880 + n * 120, 0.12, 0.12, 'triangle'); G.buzz(n > 2 ? [20, 30, 40] : 18); if (n > 2) big(n + ' at once!', null, 0.9); }
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    stop() {
      if (!G) return;
      G.group.remove(G.root); G.root.traverse(o => { if (o.material && o.material !== G.empty.material) o.material.dispose(); });
      const h = document.getElementById('mgHud'); if (h) h.style.display = 'none'; hideBig();
      G = null;
    },
  };
}
