// 8 GATES 3D — shared shell for the 3D minigames: scene, toon kit, foxes, Modernist HUD, phone controls, results.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, fbm, makeGradient, glowTexture, Ambience } from '../village-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js';
import { canvasTex, crestTex, signTex } from '../engine/textures.js';
import { save } from '../engine/save.js';
export { THREE, rr, pick, clamp, smooth, damp, fbm, canvasTex, signTex };

const CSS = `
:root { --bg:#f3f2f2; --ink:#201e1d; --accent:#ec3013; --font:"Archivo",system-ui,sans-serif; }
* { box-sizing:border-box; } html,body { margin:0; height:100%; overflow:hidden; background:#0b0a12; font-family:var(--font); color:var(--ink); -webkit-user-select:none; user-select:none; touch-action:none; }
#stage { position:fixed; inset:0; } .box { background:var(--bg); border:2px solid var(--ink); } button { font-family:var(--font); border-radius:0; cursor:pointer; }
#top { position:fixed; left:12px; right:12px; top:calc(12px + env(safe-area-inset-top)); display:flex; gap:0; z-index:10; pointer-events:none; }
#top .t { padding:6px 12px; } #top .k { font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); } #top .v { font:800 24px/1 var(--font); }
#top .grow { flex:1; } #leave { pointer-events:auto; border:2px solid var(--ink); background:var(--bg); font:800 14px var(--font); padding:0 14px; min-height:48px; }
#pop { position:fixed; left:50%; top:30%; transform:translate(-50%,-50%); font:800 clamp(30px,7vw,64px)/1 var(--font); color:var(--bg); text-shadow:0 3px 0 var(--ink),0 0 20px rgba(0,0,0,.4); pointer-events:none; z-index:12; opacity:0; transition:opacity .2s; text-align:center; letter-spacing:-.02em; }
#msg { position:fixed; left:50%; bottom:calc(20px + env(safe-area-inset-bottom)); transform:translateX(-50%); padding:6px 12px; font-weight:800; z-index:10; display:none; }
#card { position:fixed; top:0; left:0; bottom:0; width:min(520px,100%); background:var(--accent); color:var(--bg); display:flex; flex-direction:column; justify-content:space-between; gap:18px; padding:clamp(20px,5vh,40px) clamp(20px,5vw,40px) calc(clamp(20px,5vh,40px) + env(safe-area-inset-bottom)); z-index:30; overflow:auto; }
#card .k { font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; } #card h1 { font:800 clamp(40px,min(11vw,13vh),100px)/.9 var(--font); letter-spacing:-.04em; margin:0; }
#card p { font-size:16px; line-height:1.5; margin:0; max-width:400px; } #card .big { font:800 64px/1 var(--font); letter-spacing:-.03em; }
#card button { display:flex; justify-content:space-between; width:100%; min-height:56px; padding:16px 20px; background:var(--bg); color:var(--ink); border:2px solid var(--ink); font:800 18px var(--font); }
#card .row { display:flex; flex-direction:column; gap:10px; } #card .hint { display:grid; grid-template-columns:1fr 1fr; gap:8px; border-top:2px solid var(--bg); padding-top:10px; font-size:13px; }
#pad { position:fixed; right:calc(12px + env(safe-area-inset-right)); bottom:calc(16px + env(safe-area-inset-bottom)); display:flex; flex-direction:column; gap:8px; z-index:10; }
#pad button { width:84px; height:72px; border:2px solid var(--ink); background:var(--bg); font:800 15px var(--font); } #pad button.hot { background:var(--accent); color:var(--bg); }
#joy { position:fixed; left:0; bottom:0; width:55%; height:65%; z-index:8; } #knob { position:fixed; width:66px; height:66px; margin:-33px 0 0 -33px; border:2px solid var(--bg); border-radius:50%; background:rgba(243,242,242,.25); display:none; pointer-events:none; z-index:9; }
#keys { position:fixed; left:12px; bottom:12px; display:flex; font-size:12px; z-index:9; } #keys div { padding:5px 8px; border:2px solid var(--ink); border-left:0; background:var(--bg); } #keys div:first-child { border-left:2px solid var(--ink); }
@media (pointer:fine) { #pad, #joy { display:none; } } @media (pointer:coarse) { #keys { display:none; } }
@media (max-width:520px) { #top .v { font-size:20px; } #top .t { padding:5px 8px; } }
`;
export async function shell({ title, world = 'JIDDA', intro = '', how = ['', ''], buttons = [], keysHelp = [], sky = ['#7fc8ff', '#ffd9b0'], fog = 0.004, stats = ['SCORE', 'TIME'], bestKey }) {
  document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="../vendor/fonts/archivo.css"><style>' + CSS + '</style>');
  document.body.insertAdjacentHTML('beforeend', `<div id="stage"></div>
  <div id="top">${stats.map((s, i) => `<div class="t box"${i ? ' style="border-left:0"' : ''}><div class="k">${s}</div><div class="v" id="st${i}">—</div></div>`).join('')}<div class="grow"></div><button id="leave">Leave ✕</button></div>
  <div id="pop"></div><div id="msg" class="box"></div><div id="joy"></div><div id="knob"></div>
  <div id="pad">${buttons.map(b => `<button id="btn_${b.id}" class="${b.hot ? 'hot' : ''}">${b.label}</button>`).join('')}</div>
  <div id="keys">${keysHelp.map(k => `<div>${k}</div>`).join('')}</div>
  <div id="card"><div class="k">${world} · Minigame</div><div class="row" id="cardBody"><h1>${title}</h1><p>${intro}</p></div><div class="row"><button id="go"><span>Start</span><span>→</span></button><div class="hint"><div><b>Desktop</b><br>${how[0]}</div><div><b>Touch</b><br>${how[1]}</div></div></div></div>`);
  const $ = id => document.getElementById(id);
  const renderer = new THREE.WebGLRenderer({ antialias: !matchMedia('(pointer:coarse)').matches, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(pointer:coarse)').matches ? 1.5 : 2)); renderer.setSize(innerWidth, innerHeight); renderer.shadowMap.enabled = !matchMedia('(pointer:coarse)').matches; $('stage').appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 3000);
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
  const grad = makeGradient(), glowTex = glowTexture(), outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  const cache = new Map(); const toon = (c, x) => { const k = c + JSON.stringify(x || {}); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...x })); return cache.get(k); };
  const glowing = (c, k = 1.6) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, emissive: new THREE.Color(c), emissiveIntensity: k });
  function M(geo, mat, x = 0, y = 0, z = 0, parent, o = 0.04, rad) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (o) { const ol = new THREE.Mesh(geo, outlineMat); if (rad) ol.scale.setScalar(1 + o / rad); else { geo.computeBoundingBox(); const s = new THREE.Vector3(); geo.boundingBox.getSize(s); ol.scale.set(1 + 2 * o / Math.max(s.x, .01), 1 + 2 * o / Math.max(s.y, .01), 1 + 2 * o / Math.max(s.z, .01)); } m.add(ol); } (parent || scene).add(m); return m; }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const glow = (x, y, z, color, size, parent, op = 0.9) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); return s; };
  // sky dome + light
  const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color(sky[0]) }, hor: { value: new THREE.Color(sky[1]) } }, vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }', fragmentShader: 'varying vec3 vD; uniform vec3 top, hor; void main(){ float y = max(vD.y, 0.0); gl_FragColor = vec4(mix(hor, top, pow(y, 0.6)), 1.0); }' });
  const skyM = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), skyMat); scene.add(skyM);
  scene.fog = new THREE.FogExp2(new THREE.Color(sky[1]), fog);
  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x6a7a5a, 1.4)); const sun = new THREE.DirectionalLight(0xfff1dc, 2.4); sun.position.set(30, 50, 20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 }); scene.add(sun, sun.target);
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  // input
  const input = { x: 0, y: 0, held: {}, _pressed: {} }, keys = new Set();
  addEventListener('keydown', e => { keys.add(e.code); for (const b of buttons) if ((b.keys || []).includes(e.code) && !e.repeat) { input._pressed[b.id] = true; input.held[b.id] = true; } });
  addEventListener('keyup', e => { keys.delete(e.code); for (const b of buttons) if ((b.keys || []).includes(e.code)) input.held[b.id] = false; });
  for (const b of buttons) { const el = $('btn_' + b.id); el.addEventListener('pointerdown', e => { e.preventDefault(); input._pressed[b.id] = true; input.held[b.id] = true; }); const up = () => input.held[b.id] = false; el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up); }
  const J = $('joy'), K = $('knob'), joy = { on: false };
  J.addEventListener('pointerdown', e => { joy.on = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; K.style.left = e.clientX + 'px'; K.style.top = e.clientY + 'px'; K.style.display = 'block'; J.setPointerCapture(e.pointerId); });
  J.addEventListener('pointermove', e => { if (!joy.on || e.pointerId !== joy.id) return; let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const l = Math.hypot(dx, dy); if (l > 60) { dx *= 60 / l; dy *= 60 / l; } joy.x = dx / 60; joy.y = -dy / 60; K.style.left = joy.ox + dx + 'px'; K.style.top = joy.oy + dy + 'px'; });
  const je = () => { joy.on = false; joy.x = joy.y = 0; K.style.display = 'none'; }; J.addEventListener('pointerup', je); J.addEventListener('pointercancel', je);
  function readInput() { input.x = clamp((keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + (joy.x || 0), -1, 1); input.y = clamp((keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + (joy.y || 0), -1, 1); }
  input.pressed = id => { const v = !!input._pressed[id]; input._pressed[id] = false; return v; };
  // hud
  const audio = new Ambience(); let popT = 0, msgT = 0;
  const hud = { set: (...vals) => vals.forEach((v, i) => { const el = $('st' + i); if (el && el.textContent !== String(v)) el.textContent = v; }) };
  const popup = (t, col = '#f3f2f2') => { const p = $('pop'); p.textContent = t; p.style.color = col; p.style.opacity = 1; popT = 1.1; };
  const msg = (t, secs = 2) => { $('msg').textContent = t; $('msg').style.display = 'block'; msgT = secs; };
  const leave = () => { try { parent.postMessage('back', '*'); } catch (e) {} if (parent === window) history.back(); };
  $('leave').addEventListener('click', leave);
  let running = false, onStart = null, frameFns = [];
  $('go').addEventListener('click', () => { audio.init(); $('card').style.display = 'none'; running = true; onStart && onStart(); });
  function end({ score, lines = [], unit = 'POINTS', credits = 0 }) {
    running = false; let best = 0; try { best = +(localStorage.getItem('8g3d.best.' + bestKey) || 0); if (score > best) localStorage.setItem('8g3d.best.' + bestKey, score); } catch (e) {}
    if (credits && save.addGold) save.addGold(credits);
    $('cardBody').innerHTML = `<h1>${score > best ? 'New best!' : 'Heat over'}</h1><div class="big">${score} <small style="font-size:18px">${unit}</small></div><p>${lines.join('<br>')}${credits ? '<br><b>+' + credits + ' credits</b>' : ''}<br>Best: ${Math.max(best, score)}</p>`;
    $('go').firstElementChild.textContent = 'Play again'; $('card').style.display = 'flex';
  }
  const clock = new THREE.Clock(); let t = 0;
  function loop() { requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; readInput(); for (const f of frameFns) f(dt, t, running); if (popT > 0) { popT -= dt; if (popT <= 0) $('pop').style.opacity = 0; } if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('msg').style.display = 'none'; } skyM.position.copy(camera.position); renderer.render(scene, camera); }
  requestAnimationFrame(loop);
  return { THREE, scene, camera, renderer, M, BOX, toon, glowing, glow, grad, outlineMat, makeFox, animFox, PLAYER_MALE, PLAYER_FEMALE, input, hud, popup, msg, end, audio, sun, save, canvasTex, signTex,
    onStart: fn => onStart = fn, onFrame: fn => frameFns.push(fn), get running() { return running; } };
}
