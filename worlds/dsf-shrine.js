// SHRINE CANDLES (s359): Ben's 2D game (minigames/dsf/logic/shrine-candles.js) played IN THE TEMPLE OF GAYA, rules 1:1
// (4 rites: 5/7/9/11 candles, 3 s per candle, vents that breathe 3 s in every 5.6, the fan sways on its mount,
// moving the taper too fast or into a draught drains its flame, wax burns down, every 4th candle lit the bell takes one back,
// score = candles*0.66 + care*0.34). In 3D: a stone vigil table on the west side of the temple. A bronze EMBER bowl at the
// head, a brass candle fan that swings slowly beneath it, brass vent grilles with prayer ribbons that lift when they breathe,
// drifting air streaks, real candles with shader flames (flicker, lean in the draught, blue root, halo + table glow),
// smoke when one goes out, four little bells that ring when the shrine takes one back. All lit = the First Flame flares.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ALTAR = { x: 100, y: 36 }, PLOT = { x0: 8, y0: 12, x1: 192, y1: 122 }, LIGHT_R = 9, RELIGHT_R = 15;
const VENTS = {
  left: { gx: 8, gy: 62, gw: 6, gh: 18, zx: 14, zy: 52, zw: 28, zh: 34, dir: 1 },
  right: { gx: 186, gy: 62, gw: 6, gh: 18, zx: 158, zy: 52, zw: 28, zh: 34, dir: -1 },
  lowLeft: { gx: 8, gy: 96, gw: 6, gh: 16, zx: 14, zy: 88, zw: 26, zh: 26, dir: 1 },
  lowRight: { gx: 186, gy: 96, gw: 6, gh: 16, zx: 160, zy: 88, zw: 26, zh: 26, dir: -1 },
  mid: { gx: 97, gy: 117, gw: 16, gh: 5, zx: 87, zy: 104, zw: 26, zh: 14, dir: 0 } };
const RITES = [
  { name: 'EVENING LAMPS', candles: 5, vents: ['left'], limit: 78, drain: 46, wax: 5.2, wane: 0, sway: 0.22 },
  { name: 'FIRST WATCH', candles: 7, vents: ['left', 'right'], limit: 70, drain: 54, wax: 6, wane: 0.8, sway: 0.26 },
  { name: 'THE LONG NIGHT', candles: 9, vents: ['left', 'right', 'lowLeft'], limit: 62, drain: 62, wax: 6.6, wane: 1.1, sway: 0.3 },
  { name: 'FOUNDING DAY', candles: 11, vents: ['left', 'right', 'lowLeft', 'lowRight'], limit: 56, drain: 70, wax: 7.2, wane: 1.3, sway: 0.38 }];
const VENT_PERIOD = 5.6, VENT_ON = 3, SWAY_RATE = (2 * Math.PI) / 16, TOLL_EVERY = 4, SEC_PER_CANDLE = 3, CANDLE_SNUFF = 58;
function layout(count) { const out = [], inner = Math.min(count, 6), outer = count - inner, ang = (i, tot) => (tot === 1 ? 90 : 36 + (i / (tot - 1)) * 108) * Math.PI / 180;
  for (let i = 0; i < inner; i++) out.push({ ang: ang(i, inner), r: 50, lit: false, life: 0 }); for (let i = 0; i < outer; i++) out.push({ ang: ang(i, outer), r: 68, lit: false, life: 0 }); return out; }
const candlePos = (c, spin) => ({ x: ALTAR.x + Math.cos(c.ang + spin) * c.r, y: ALTAR.y + Math.sin(c.ang + spin) * c.r });
// the 2D hymn: low drone, warm pad, a bell arpeggio above it
const MUSIC = (() => { const notes = [], chords = [[41, 48, 53], [43, 50, 55], [38, 45, 50], [36, 43, 48]];
  chords.forEach((ch, s) => { const at = s * 8; notes.push({ b: at, m: ch[0] - 12, d: 7.6, v: 'drone' }); ch.forEach((m, i) => notes.push({ b: at + i * 0.4, m, d: 6.4, v: 'pad' })); [0, 2.5, 4, 6].forEach((off, i) => notes.push({ b: at + off, m: ch[(i + 1) % 3] + 24, d: 1.8, v: 'bell' })); });
  [3.5, 11.5, 19.5, 27.5].forEach(b => notes.push({ b, m: 84, d: 2.2, v: 'bell' })); return { notes, beats: 32, spb: 0.56 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

// ---- the flame: a camera-facing teardrop drawn in a shader (flicker, licking tongue, lean, blue root, soft glow)
const FLAME_VS = `uniform float uSize; varying vec2 vUv;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += vec2((uv.x - 0.5) * 0.8, uv.y - 0.1) * uSize; gl_Position = projectionMatrix * mv; }`;
const FLAME_FS = `uniform float uT, uSeed, uLife, uLean, uOn, uGust; varying vec2 vUv;
float hs(float n){ return fract(sin(n) * 43758.5453); }
float ns(float x){ float i = floor(x), f = fract(x); return mix(hs(i), hs(i + 1.0), f * f * (3.0 - 2.0 * f)); }
void main(){
  if (uOn < 0.01) discard;
  float t = uT + uSeed * 7.31;
  float fl = 0.86 + 0.1 * ns(t * 9.0 + uSeed) + 0.05 * sin(t * 17.3 + uSeed * 3.0);
  fl *= mix(0.6, 1.0, uLife) * mix(1.0, 0.62 + 0.5 * ns(t * 26.0), uGust);
  float h = vUv.y / (0.9 * fl);
  float x = (vUv.x - 0.5) * 2.0;
  float bend = pow(clamp(h, 0.0, 1.0), 1.6);
  x -= (uLean * 0.5 + (ns(t * 3.1) - 0.5) * 0.22 + sin(h * 7.0 - t * 11.0) * 0.05 * (1.0 + uGust * 2.5)) * bend;
  float w = 0.74 * sqrt(clamp(h * 1.3, 0.0, 1.0)) * pow(clamp(1.0 - h, 0.0, 1.0), 1.05) * (1.0 - 0.18 * uGust);
  float d = abs(x) / max(w, 0.0001);
  float body = (1.0 - smoothstep(0.55, 1.0, d)) * step(0.0, h) * (1.0 - smoothstep(0.9, 1.0, h));
  float core = (1.0 - smoothstep(0.0, 0.6, d)) * (1.0 - smoothstep(0.22, 0.6, h)) * smoothstep(0.02, 0.12, h);
  vec3 col = mix(vec3(1.0, 0.36, 0.06), vec3(1.0, 0.74, 0.26), 1.0 - smoothstep(0.35, 1.0, d));
  col = mix(col, vec3(1.0, 0.72, 0.3), smoothstep(0.55, 0.95, h) * 0.5);
  col = mix(col, vec3(1.0, 0.97, 0.86), core);
  float blue = (1.0 - smoothstep(0.0, 0.2, h)) * smoothstep(0.25, 0.9, d) * body;
  col = mix(col, vec3(0.32, 0.48, 1.0), blue * 0.85);
  col *= mix(0.72, 1.0, uLife);
  float a = max(body * (0.6 + 0.4 * (1.0 - smoothstep(0.45, 1.0, h))), core);
  float g = exp(-2.6 * max(d - 0.7, 0.0)) * (1.0 - smoothstep(0.3, 1.15, h)) * 0.22 * (1.0 - body) * step(-0.1, h);
  gl_FragColor = vec4(col + vec3(1.0, 0.55, 0.18) * g, clamp(a + g, 0.0, 1.0) * uOn);
}`;

export function makeShrine(K, { group, OX, at, blocks, hiring, roomW = 11, roomH = 8, audio, save, LOW, portrait = () => false, camera, hooks = {} }) {
  const { THREE, basic, glowSprite, toon } = K;
  const PW = 3.0, PH = 2.1, U = PW / 200, YS = 0.92, GOLD = '#f2d98b', red = '#ec3013', WARN = '#ff9a6a';
  const toW = (px, py) => [(px / 200 - 0.5) * PW, (py / 140 - 0.5) * PH];
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); group.add(root);
  const tx = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = root) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); p.add(m); return m; };
  const Cy = (r1, r2, h, mat, x, y, z, seg = 16, p = root) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); p.add(m); return m; };
  const flat = (geo, mat, x, y, z, p = root) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); p.add(m); return m; };
  const soft = (r, g, b) => tx(canvas(128, 128, (c, w) => { const gr = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.45, `rgba(${r},${g},${b},0.35)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); c.fillStyle = gr; c.fillRect(0, 0, w, w); }));
  const warmTex = soft(255, 170, 80), smokeTex = soft(200, 190, 180);
  const stone = toon('#6a5a48'), dark = toon('#3a2e22'), brass = toon('#c9a24a'), bronze = toon('#8a5a2a'), goldM = toon(GOLD);
  // ---- the vigil table: plinth, slab, gold band, a low rim round the inlay
  B(PW - 0.3, YS - 0.14, PH - 0.3, dark, 0, (YS - 0.14) / 2, 0); B(PW + 0.34, 0.14, PH + 0.34, stone, 0, YS - 0.07, 0); B(PW + 0.38, 0.03, PH + 0.38, goldM, 0, YS - 0.15, 0);
  for (const s of [-1, 1]) { B(PW + 0.34, 0.05, 0.08, stone, 0, YS + 0.025, s * (PH / 2 + 0.13)); B(0.08, 0.05, PH + 0.18, stone, s * (PW / 2 + 0.13), YS + 0.025, 0); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) Cy(0.07, 0.07, 0.12, goldM, sx * (PW / 2 + 0.13), YS + 0.06, sz * (PH / 2 + 0.13), 10);
  if (blocks) blocks.push([at.x - PW / 2 - 0.2, at.x + PW / 2 + 0.2, at.z - PH / 2 - 0.2, at.z + PH / 2 + 0.2]);
  // ---- the inlay canvas (game units 200 x 140): warm stone, rays from the ember, the relight ring, words that turn with the view
  const CW = LOW ? 800 : 1200, CH = Math.round(CW * 0.7), S = CW / 200, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d'), tex = tx(cv);
  flat(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, YS + 0.002, 0);
  const grain = []; { let q = 7; const r = () => (q = (q * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 70; i++) grain.push([r() * 200, r() * 140, 2 + r() * 9, r() * 0.07]); }
  // ---- the ember bowl at the head (light the taper here) + its glow
  const [ax, az] = toW(ALTAR.x, ALTAR.y);
  Cy(0.08, 0.06, 0.03, bronze, ax, YS + 0.015, az, 18); Cy(0.12, 0.075, 0.07, bronze, ax, YS + 0.06, az, 20); { const coal = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), basic('#ff8a2a')); coal.rotation.x = -Math.PI / 2; coal.position.set(ax, YS + 0.092, az); root.add(coal); }
  const glowM = (op) => new THREE.MeshBasicMaterial({ map: warmTex, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const emberGlow = flat(new THREE.PlaneGeometry(1.0, 1.0), glowM(0.55), ax, YS + 0.004, az);
  // ---- flames
  const flames = [], quad = new THREE.PlaneGeometry(1, 1);
  function makeFlame(size, seed, parent) { const m = new THREE.ShaderMaterial({ vertexShader: FLAME_VS, fragmentShader: FLAME_FS, transparent: true, depthWrite: false, uniforms: { uSize: { value: size }, uT: { value: 0 }, uSeed: { value: seed }, uLife: { value: 1 }, uLean: { value: 0 }, uOn: { value: 0 }, uGust: { value: 0 } } });
    const f = new THREE.Mesh(quad, m); f.frustumCulled = false; f.renderOrder = 6; parent.add(f); const halo = glowSprite(0, 0, 0, 0xffa24a, size * 2.4, 0, parent); halo.renderOrder = 5; const F = { f, m, halo, size, on: 0, pop: 0, seed }; flames.push(F); return F; }
  const ember = makeFlame(0.44, 0.37, root); ember.f.position.set(ax, YS + 0.1, az); ember.halo.position.set(ax, YS + 0.22, az); ember.on = 1;
  // ---- the four bells (fill as you light; the fourth rings and the shrine takes one back)
  const bellOff = toon('#a87a3a'), bellOn = basic('#ffd36a'), bells = [];
  for (let i = 0; i < 4; i++) { const [bx, bz] = toW(79 + i * 14, 17), bg = new THREE.Group(); bg.position.set(bx, YS, bz); root.add(bg);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), bellOff); bg.add(m); const lip = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 20), brass); lip.rotation.x = Math.PI / 2; bg.add(lip); Cy(0.012, 0.012, 0.03, brass, 0, 0.07, 0, 6, bg); bells.push({ g: bg, m, ring: 0 }); }
  // ---- the swinging candle fan: brass arcs + spokes pivot under the ember
  const fan = new THREE.Group(); fan.position.set(ax, YS, az); root.add(fan);
  const arc = r => { const pts = []; for (let i = 0; i <= 28; i++) { const a = (36 + i / 28 * 108) * Math.PI / 180; pts.push(new THREE.Vector3(Math.cos(a) * r * U, 0.012, Math.sin(a) * r * U)); } return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.011, 6, false), brass); };
  const rail1 = arc(50), rail2 = arc(68); fan.add(rail1, rail2);
  for (const a of [36, 144]) { const r0 = 0.12, r1 = 68 * U, aa = a * Math.PI / 180, sp = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, r1 - r0, 6), brass); sp.rotation.z = Math.PI / 2; sp.rotation.y = -aa; sp.position.set(Math.cos(aa) * (r0 + r1) / 2, 0.012, Math.sin(aa) * (r0 + r1) / 2); fan.add(sp); }
  Cy(0.13, 0.13, 0.012, brass, 0, 0.006, 0, 24, fan);
  const waxM = toon('#e2cfa6'), poolM = toon('#f0dfb8'), wickM = toon('#1a1210'), CANDLES = [];
  for (let i = 0; i < 11; i++) { const g = new THREE.Group(); fan.add(g); Cy(0.062, 0.052, 0.022, brass, 0, 0.011, 0, 14, g); const h = 0.11 + (i % 3) * 0.012;
    Cy(0.045, 0.047, h, waxM, 0, 0.022 + h / 2, 0, 14, g); Cy(0.038, 0.038, 0.004, poolM, 0, 0.022 + h + 0.001, 0, 14, g); Cy(0.0035, 0.0035, 0.018, wickM, 0, 0.022 + h + 0.009, 0, 5, g);
    const dg = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), waxM); dg.position.set(0.043, 0.022 + h - 0.02, 0.006); dg.scale.y = 1.8; g.add(dg);
    const fl = makeFlame(0.19, i * 1.71 + 0.2, g); fl.f.position.y = 0.022 + h + 0.014; fl.halo.position.y = 0.022 + h + 0.06;
    const gl = flat(new THREE.PlaneGeometry(0.42, 0.42), glowM(0), 0, 0.003, 0, g); CANDLES.push({ g, fl, gl }); }
  // ---- vents: brass grilles with prayer ribbons, a soft draught field, drifting air streaks
  const VENT3 = {}, streakM = () => new THREE.MeshBasicMaterial({ color: 0xeaf4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const zoneTex = tx(canvas(128, 128, (cc, w) => { const g1 = cc.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w * 0.62); g1.addColorStop(0, 'rgba(220,236,255,0.9)'); g1.addColorStop(1, 'rgba(220,236,255,0)'); cc.fillStyle = g1; cc.fillRect(0, 0, w, w); }));
  const ribM = [toon('#b8321e', { side: THREE.DoubleSide }), toon(GOLD, { side: THREE.DoubleSide })];
  for (const [k, v] of Object.entries(VENTS)) { const vg = new THREE.Group(); root.add(vg); vg.visible = false; const [cx, cz] = toW(v.gx + v.gw / 2, v.gy + v.gh / 2), w = v.gw * U, d = v.gh * U, side = v.dir !== 0;
    if (side) { B(w, 0.07, d, brass, cx, YS + 0.035, cz, vg); for (let s = 0; s < 4; s++) B(w + 0.004, 0.012, 0.014, dark, cx, YS + 0.074, cz - d / 2 + d * (s + 0.5) / 4, vg); }
    else { B(w, 0.016, d, brass, cx, YS + 0.008, cz, vg); for (let s = 0; s < 5; s++) B(0.012, 0.004, d - 0.016, dark, cx - w / 2 + w * (s + 0.5) / 5, YS + 0.017, cz, vg); }
    const [zx, zz] = toW(v.zx + v.zw / 2, v.zy + v.zh / 2), zone = flat(new THREE.PlaneGeometry(v.zw * U * 1.15, v.zh * U * 1.15), new THREE.MeshBasicMaterial({ map: zoneTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), zx, YS + 0.005, zz, vg);
    const streaks = []; for (let i = 0; i < 5; i++) { const sm = flat(new THREE.PlaneGeometry(side ? 0.16 : 0.006, side ? 0.006 : 0.12), streakM(), 0, YS + 0.02 + i * 0.006, 0, vg); streaks.push({ m: sm, u: i / 5, l: (i * 0.37) % 1 }); }
    const ribs = []; for (let i = 0; i < 2; i++) { const geo = new THREE.PlaneGeometry(0.17, 0.022, 8, 1); geo.rotateX(-Math.PI / 2); geo.translate(0.085, 0, 0); const base = geo.attributes.position.array.slice(); const pv = new THREE.Group(); vg.add(pv);
      const [px, pz] = side ? toW(v.dir > 0 ? v.gx + v.gw : v.gx, v.gy + v.gh * (0.3 + i * 0.4)) : toW(v.gx + v.gw * (0.3 + i * 0.4), v.gy); pv.position.set(px, YS + (side ? 0.07 : 0.02), pz); const m = new THREE.Mesh(geo, ribM[i]); pv.add(m); ribs.push({ pv, geo, base, i }); }
    VENT3[k] = { v, vg, zone, streaks, ribs, amt: 0, stir: 0, side, idleA: side ? -Math.PI / 2 : (Math.PI / 2 + 0.9), blowA: side ? (v.dir > 0 ? 0 : Math.PI) : Math.PI / 2 }; }
  // ---- the taper (held), smoke, the guide ring, the all-lit ring
  const taper = new THREE.Group(); root.add(taper); const tpv = new THREE.Group(); taper.add(tpv); tpv.rotation.x = Math.PI / 2 - 0.78;
  const stick = Cy(0.011, 0.012, 1, toon('#f6eedc'), 0, 0.5, 0, 10, tpv), collar = Cy(0.04, 0.04, 0.006, brass, 0, 0.2, 0, 16, tpv); Cy(0.003, 0.003, 0.016, wickM, 0, 0.004, 0, 5, tpv);
  const tFlame = makeFlame(0.19, 9.1, taper); tFlame.f.position.y = 0.008; tFlame.halo.position.y = 0.04;
  const smoke = []; for (let i = 0; i < (LOW ? 14 : 26); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false, color: 0xb8b0a8 })); sp.visible = false; root.add(sp); smoke.push({ sp, t: 9, vx: 0, vz: 0 }); }
  function puff(x, y, z, n = 4) { for (let k = 0; k < n; k++) { const p = smoke.find(q => q.t > 2.2); if (!p) return; p.t = -k * 0.08; p.sp.position.set(x, y, z); p.vx = (Math.random() - 0.5) * 0.06; p.vz = (Math.random() - 0.5) * 0.06; p.sp.visible = true; } }
  const guide = flat(new THREE.RingGeometry(0.1, 0.13, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), 0, YS + 0.006, 0); guide.renderOrder = 4;
  const burst = flat(new THREE.RingGeometry(0.92, 1, 64), new THREE.MeshBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), ax, YS + 0.01, az); let burstT = -1;
  let lamp = null; if (!LOW) { lamp = new THREE.PointLight(0xffb060, 0, 4.2, 1.6); lamp.position.set(0, YS + 0.9, 0.2); root.add(lamp); }
  // ---- the stand: red floor ring + a big sign on a post; NOW HIRING board on the west wall
  const stZ = PH / 2 + 0.95;
  { const fr = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 48), basic(red, 0.95)); fr.rotation.x = -Math.PI / 2; fr.position.set(0, 0.04, stZ); root.add(fr);
    const fi = new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: red, transparent: true, opacity: 0.18, depthWrite: false })); fi.rotation.x = -Math.PI / 2; fi.position.set(0, 0.035, stZ); root.add(fi); root.userData.ring = [fr, fi];
    const px = -2.2, pz = PH / 2 + 0.7; B(0.08, 1.9, 0.08, dark, px, 0.95, pz); if (blocks) blocks.push([at.x + px - 0.15, at.x + px + 0.15, at.z + pz - 0.15, at.z + pz + 0.15]);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.62), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 352, (cc, w, h) => { cc.fillStyle = '#1a1008'; cc.fillRect(0, 0, w, h); cc.strokeStyle = GOLD; cc.lineWidth = 12; cc.strokeRect(6, 6, w - 12, h - 12); cc.textBaseline = 'middle'; cc.fillStyle = GOLD; cc.font = `900 104px ${FONT}`; cc.fillText('SHRINE CANDLES', 40, 112); cc.fillStyle = '#f3f2f2'; cc.font = `900 64px ${FONT}`; cc.fillText('STAND ON THE RED RING', 40, 250); })), toneMapped: false }));
    sg.position.set(px, 2.1, pz + 0.05); root.add(sg); B(1.9, 0.72, 0.05, dark, px, 2.1, pz); }
  if (hiring) { const hx = -roomW + 0.17; const hm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 512, (cc, w, h) => { cc.fillStyle = '#1a1008'; cc.fillRect(0, 0, w, h); cc.strokeStyle = red; cc.lineWidth = 14; cc.strokeRect(7, 7, w - 14, h - 14); cc.textBaseline = 'middle'; cc.fillStyle = red; cc.font = `900 120px ${FONT}`; cc.fillText('NOW HIRING', 48, 140); cc.fillStyle = '#f3f2f2'; cc.font = `900 62px ${FONT}`; cc.fillText('VIGIL KEEPER', 48, 290); cc.fillStyle = GOLD; cc.fillText('SHRINE CANDLES · TAP TO START', 48, 390); })), toneMapped: false }));
    hm.rotation.y = Math.PI / 2; hm.position.set(hx - at.x + 0.02, 1.9, hiring.z - at.z); root.add(hm); B(0.06, 1.2, 2.3, goldM, hx - at.x - 0.02, 1.9, hiring.z - at.z); }

  // ---- sound through the station mixer
  let bus = null, mStart = 0, mBar = 0, noise = null;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null, OUT = () => audio.master || audio.ctx.destination;
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.014); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(OUT()); o.start(t); o.stop(t + dur + 0.03); }
  function hiss(o) { const ac = AC(); if (!ac) return; if (!noise) { noise = ac.createBuffer(1, ac.sampleRate * 1.2, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; src.buffer = noise; src.loop = true; f.type = o.type || 'bandpass'; f.Q.value = o.q == null ? 1 : o.q; f.frequency.setValueAtTime(o.f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, o.f1), t + o.dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.gain, t + (o.att || 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur); src.connect(f); f.connect(g); g.connect(OUT()); src.start(t); src.stop(t + o.dur + 0.05); }
  function sfx(k) { if (k === 'take') tone(660, 0.06, 0.03, 'triangle', 880);
    else if (k === 'kindle') { hiss({ f0: 1800, f1: 700, dur: 0.14, gain: 0.05, q: 1.2 }); [0, 7].forEach((s, i) => setTimeout(() => tone(midiHz(81 + s), 0.2, 0.04, 'sine'), i * 70)); }
    else if (k === 'light') { hiss({ f0: 2400, f1: 900, dur: 0.1, gain: 0.04, q: 1.4 }); tone(midiHz(88), 0.22, 0.035, 'sine'); }
    else if (k === 'out') { hiss({ f0: 700, f1: 180, dur: 0.26, gain: 0.05, type: 'lowpass', q: 0.7 }); tone(200, 0.2, 0.035, 'sine', 130); }
    else if (k === 'all') [0, 4, 7, 12, 16].forEach((s, i) => setTimeout(() => tone(midiHz(76 + s), 0.34, 0.045, 'sine'), i * 130));
    else if (k === 'time') tone(190, 0.3, 0.05, 'triangle', 120);
    else if (k === 'bell') { tone(midiHz(84), 1.4, 0.04, 'sine'); tone(midiHz(91), 1.0, 0.018, 'sine'); }
    else if (k === 'breath') hiss({ f0: 380, f1: 900, dur: 2.6, gain: 0.018, type: 'lowpass', q: 0.5, att: 0.8 });
    else if (k === 'open') { tone(196, 1.4, 0.03, 'sine', 392); setTimeout(() => tone(midiHz(84), 1.2, 0.025, 'sine'), 600); } }
  function voice(nt, at0) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb; let peak = 0.02;
    if (nt.v === 'drone') { o.type = 'sine'; peak = 0.042; } else if (nt.v === 'pad') { o.type = 'triangle'; peak = 0.016; } else { o.type = 'sine'; peak = 0.03; }
    o.frequency.setValueAtTime(midiHz(nt.m), at0); g.gain.setValueAtTime(0.0001, at0); g.gain.exponentialRampToValueAtTime(peak, at0 + (nt.v === 'bell' ? 0.02 : 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, at0 + dur); o.connect(g); g.connect(bus); o.start(at0); o.stop(at0 + dur + 0.04); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(OUT()); mStart = ac.currentTime + 0.12; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 1) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.2); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 900); } catch (e) {} } bus = null; }

  // ---- the game (the 2D rules)
  let s = null, overlay = 'intro', cardInfo = null, open = false, ending = false, openK = 0, speed = 0, lastPt = null, vel = [0, 0], lastType = 'mouse', drawKey = '', wasOn = [];
  window.addEventListener('pointerdown', e => { lastType = e.pointerType || 'mouse'; }, true);
  function fresh(round) { const r = RITES[round % 4]; return { round, rite: r, candles: layout(r.candles), vents: r.vents.map(k => VENTS[k]), vkeys: r.vents, taper: { x: 100, y: 84 }, held: false, lit: false, flame: 0, wax: 100, guttered: 0, spent: 0, blown: 0, tolled: 0, everLit: false, lightings: 0, t: 0, peak: 0,
    timeLeft: r.candles * SEC_PER_CANDLE, total: r.candles * SEC_PER_CANDLE, done: false, outcome: null, card: 1.7 }; }
  function setRite() { const n = s.candles.length; CANDLES.forEach((C, i) => { C.g.visible = i < n; C.fl.on = 0; if (i < n) { const cd = s.candles[i]; C.g.position.set(Math.cos(cd.ang) * cd.r * U, 0, Math.sin(cd.ang) * cd.r * U); } });
    rail2.visible = s.candles.some(cd => cd.r === 68); for (const [k, V] of Object.entries(VENT3)) V.vg.visible = s.vkeys.includes(k); wasOn = s.vkeys.map(() => false); drawKey = ''; }
  const spin = () => s ? (s.rite.sway || 0) * Math.sin(s.t * SWAY_RATE) : 0;
  const ventOn = i => ((s.t + i * 1.8) % VENT_PERIOD) < VENT_ON;
  const ventStir = i => { const ph = (s.t + i * 1.8) % VENT_PERIOD; return ph < VENT_ON ? 1 : ph > VENT_PERIOD - 0.7 ? (ph - (VENT_PERIOD - 0.7)) / 0.7 * 0.35 : 0; };
  const inVent = (x, y) => s.vents.some((v, i) => ventOn(i) && x > v.zx && x < v.zx + v.zw && y > v.zy && y < v.zy + v.zh);
  const litN = () => s.candles.filter(cd => cd.lit).length;
  function scoreOf() { const tot = s.candles.length, best = Math.max(litN(), s.peak), completion = Math.round(best / tot * 100), care = clamp(100 - s.guttered * 11 - s.spent * 5 - s.blown * 4, 0, 100); return { best, completion, care, score: Math.round(completion * 0.66 + care * 0.34) }; }
  function finish() { const r = s.rite, tot = s.candles.length, all = litN() === tot, { best, completion, care, score: sc } = scoreOf(), stars = sc >= 92 ? 3 : sc >= 78 ? 2 : 1, gold = [0, 10, 20, 30][stars];
    const prev = save.stat('dsfShrineBest', 0), isBest = save.best('dsfShrineBest', sc); save.addGold(gold); save.setStat('dsfShrineRites', save.stat('dsfShrineRites', 0) + 1); if (all && !save.flag('dsfShrineDone')) save.setFlag('dsfShrineDone');
    const col = v => v >= 75 ? '#8fe38f' : v >= 45 ? '#ffd23a' : red, last = s.round % 4 === 3, time = s.outcome === 'time', notes = [];
    if (best < tot) notes.push('Most alight at once: ' + best + ' of ' + tot + '.');
    if (s.guttered) notes.push('The taper blew out ' + s.guttered + (s.guttered > 1 ? ' times.' : ' time.'));
    if (s.spent) notes.push(s.spent + ' taper' + (s.spent > 1 ? 's' : '') + ' burned down to nothing.');
    if (s.blown) notes.push(s.blown + ' candle' + (s.blown > 1 ? 's' : '') + ' blown out by the vents.');
    if (s.tolled) notes.push('The shrine took ' + s.tolled + ' back, one for every four lit.');
    if (all && !s.guttered && !s.spent) notes.push('Not a flame lost on the way.');
    overlay = 'card'; cardInfo = { kicker: time ? r.name + ' · time ran out' : last ? 'Observances kept · ' + r.name : r.name + ' · kept', title: sc + ' / 100',
      mood: time ? 'The hour passed with the shrine unfinished. Begin again.' : sc >= 92 ? 'Not a candle missed, not a flame lost.' : sc >= 78 ? 'A well-kept rite.' : sc >= 60 ? 'The shrine is lit, mostly.' : 'Rather a lot of relighting.',
      stars, best: isBest ? 'NEW BEST' : 'BEST ' + Math.max(prev, sc), gold: '+' + gold + ' G',
      rows: [{ name: 'Candles', val: completion + '', pct: completion + '%', color: col(completion) }, { name: 'Flame kept', val: care + '', pct: care + '%', color: col(care) }],
      notes, buttons: [time ? 'LIGHT THEM AGAIN' : last ? 'KEEP THE RITES AGAIN' : 'NEXT OBSERVANCE', 'LEAVE THE SHRINE'] }; }
  function candleW(i) { const cd = s.candles[i], p = candlePos(cd, spin()); return toW(p.x, p.y); }
  function place(p) { if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return; s.taper = { x: clamp(p.x, PLOT.x0, PLOT.x1), y: clamp(p.y, PLOT.y0, PLOT.y1) };
    if (Math.hypot(p.x - ALTAR.x, p.y - ALTAR.y) < RELIGHT_R) { if (!s.lit || s.flame < 99 || s.wax < 99) { if (!s.lit) { sfx('kindle'); tFlame.pop = 1; ember.pop = 0.6; } s.lit = true; s.flame = 100; s.wax = 100; s.everLit = true; } return; }
    if (!s.lit) return; let hit = -1; const sp = spin();
    s.candles.forEach((cd, i) => { if (cd.lit) return; const q = candlePos(cd, sp); if (Math.hypot(p.x - q.x, p.y - (q.y - 4)) < LIGHT_R) hit = i; });
    if (hit < 0) return; const cd = s.candles[hit]; cd.lit = true; cd.life = 100; CANDLES[hit].fl.pop = 1; s.lightings++; sfx('light'); hooks.light && hooks.light();
    if (s.lightings % TOLL_EVERY === 0) { let victim = -1, low = 1e9; s.candles.forEach((q, i) => { if (i === hit || !q.lit) return; if (q.life < low) { low = q.life; victim = i; } });
      for (const b of bells) b.ring = 1; setTimeout(() => sfx('bell'), 60);
      if (victim >= 0) { s.candles[victim].lit = false; s.candles[victim].life = 0; s.tolled++; const V = victim; setTimeout(() => { sfx('out'); }, 180); snuff(V); } }
    if (s.candles.every(q => q.lit)) { sfx('all'); s.done = true; s.outcome = 'all'; burstT = 0; hooks.all && hooks.all(); const me = s; setTimeout(() => { if (s === me && open) finish(); }, 1900); } }
  const wp = new THREE.Vector3();
  function snuff(i) { const C = CANDLES[i]; C.fl.f.getWorldPosition(wp); root.worldToLocal(wp); puff(wp.x, wp.y + 0.03, wp.z, 4); }

  // ---- the inlay drawing (only when the words change)
  function words() { if (!s) return { hint: 'SHRINE CANDLES', col: GOLD, toll: '' };
    if (s.card > 0 && !overlay) return { hint: '', col: GOLD, toll: '', card: [s.rite.name, s.candles.length + ' CANDLES · ' + s.total + ' SECONDS'] };
    const all = litN() === s.candles.length; let hint, col = GOLD;
    if (all) hint = 'EVERY CANDLE LIT · THE RITE IS KEPT'; else if (s.timeLeft <= 0) { hint = 'THE HOUR HAS PASSED'; col = WARN; }
    else if (!s.everLit) hint = 'TOUCH THE EMBER TO LIGHT YOUR TAPER';
    else if (!s.lit) { hint = s.wax <= 0 ? 'TAPER SPENT · A FRESH ONE AT THE EMBER' : 'BLOWN OUT · BACK TO THE EMBER'; col = WARN; }
    else if (inVent(s.taper.x, s.taper.y)) { hint = 'IN THE DRAUGHT · MOVE OUT'; col = WARN; }
    else if (s.flame < 50) { hint = 'GENTLY · LET THE FLAME RECOVER'; col = WARN; }
    else if (s.wax < 30) { hint = 'RUNNING SHORT ON WAX'; col = WARN; }
    else hint = 'TOUCH EACH CANDLE · MOVE GENTLY';
    const left = TOLL_EVERY - (s.lightings % TOLL_EVERY); return { hint, col, toll: 'BELL · ' + left + ' MORE TAKES ONE' }; }
  function draw() { const w = words(), pr = portrait(), key = JSON.stringify(w) + pr; if (key === drawKey) return; drawKey = key;
    c.setTransform(1, 0, 0, 1, 0, 0); c.save(); c.scale(S, S);
    const bg = c.createRadialGradient(ALTAR.x, ALTAR.y, 4, ALTAR.x, ALTAR.y, 170); bg.addColorStop(0, '#4a3018'); bg.addColorStop(0.5, '#2c1d10'); bg.addColorStop(1, '#1a1009'); c.fillStyle = bg; c.fillRect(0, 0, 200, 140);
    for (const [gx, gy, r, a] of grain) { c.fillStyle = `rgba(0,0,0,${a})`; c.beginPath(); c.arc(gx, gy, r, 0, 6.283); c.fill(); }
    c.strokeStyle = 'rgba(242,217,139,0.09)'; c.lineWidth = 0.6; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; c.beginPath(); c.moveTo(ALTAR.x + Math.cos(a) * 18, ALTAR.y + Math.sin(a) * 18); c.lineTo(ALTAR.x + Math.cos(a) * 220, ALTAR.y + Math.sin(a) * 220); c.stroke(); }
    c.strokeStyle = 'rgba(242,217,139,0.12)'; c.lineWidth = 0.5; for (const r of [50, 68]) { c.beginPath(); c.arc(ALTAR.x, ALTAR.y, r, 0.35, Math.PI - 0.35); c.stroke(); }
    c.strokeStyle = GOLD; c.lineWidth = 0.8; c.strokeRect(2.5, 2.5, 195, 135); c.lineWidth = 0.3; c.strokeRect(4.5, 4.5, 191, 131);
    c.setLineDash([2, 1.6]); c.strokeStyle = 'rgba(242,217,139,0.75)'; c.lineWidth = 0.7; c.beginPath(); c.arc(ALTAR.x, ALTAR.y, RELIGHT_R, 0, 6.283); c.stroke(); c.setLineDash([]);
    const txt = (t, sx, sy, size, col, align = 'left', maxW = 180) => { c.save(); if (pr) { c.translate(200 - sy, sx); c.rotate(Math.PI / 2); } else c.translate(sx, sy); c.font = `900 ${size}px ${FONT}`; let fs = size; const tw = c.measureText(t).width; if (tw > maxW) { fs = size * maxW / tw; c.font = `900 ${fs}px ${FONT}`; } c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(t, 0, 0); c.restore(); };
    if (pr) { txt(w.hint, 6, 195.5, 6.6, w.col, 'left', 128); if (w.toll) txt(w.toll, 134, 4.6, 5.2, '#f3e6c0', 'right', 90); }
    else { txt(w.hint, 9, 131, 6.4, w.col, 'left', 120); if (w.toll) txt(w.toll, 191, 7.2, 5, '#f3e6c0', 'right', 70); }
    if (w.card) { c.fillStyle = 'rgba(16,9,4,0.9)'; if (pr) c.fillRect(64, 0, 70, 140); else c.fillRect(0, 50, 200, 40); c.fillStyle = red; if (pr) c.fillRect(133, 0, 1.2, 140); else c.fillRect(0, 50, 200, 1.2);
      const cx = pr ? 70 : 100, cy = pr ? 100 : 70; txt(w.card[0], pr ? 10 : 12, pr ? 92 : 64, 11, '#f3f2f2', 'left', pr ? 120 : 176); txt(w.card[1], pr ? 10 : 12, pr ? 108 : 79, 6.4, GOLD, 'left', pr ? 120 : 176); void cx; void cy; }
    c.restore(); tex.needsUpdate = true; }
  s = fresh(save.stat('dsfShrineRound', 0) % 4); setRite(); draw();

  // ---- every frame: flames, vents, fan, taper, smoke
  const camR = new THREE.Vector3();
  function flameTick(F, T, dt, life, lean, gust) { F.pop = Math.max(0, F.pop - dt * 2.4); const on = F.on, u = F.m.uniforms; u.uT.value = T; u.uLife.value = life; u.uLean.value += (lean - u.uLean.value) * Math.min(1, dt * 8); u.uGust.value += (gust - u.uGust.value) * Math.min(1, dt * 6); u.uOn.value = on;
    u.uSize.value = F.size * (0.62 + 0.38 * life) * (1 + F.pop * 0.6); F.f.visible = on > 0.01; const fk = 0.86 + 0.14 * Math.sin(T * 13 + F.seed * 5) * Math.sin(T * 7.3 + F.seed);
    F.halo.material.opacity = on * (0.35 + 0.25 * life) * fk; F.halo.scale.setScalar(F.size * (2.0 + 0.8 * life) * (1 + F.pop * 0.5)); return fk; }
  function render3D(dt, T) { openK = open && !ending ? Math.min(1, openK + dt / 1.0) : Math.max(0, openK - dt / 0.9);
    if (camera) camR.setFromMatrixColumn(camera.matrixWorld, 0); const leanOf = (dx, dz) => clamp(dx * camR.x + dz * camR.z, -1, 1);
    const [fr, fi] = root.userData.ring; fi.material.opacity = 0.12 + 0.1 * Math.sin(T * 3); fr.scale.setScalar(1 + 0.04 * Math.sin(T * 3)); fr.visible = fi.visible = !open;
    const live = s && open; fan.rotation.y = live ? -spin() : fan.rotation.y * Math.max(0, 1 - dt * 1.5);
    // the ember
    const ek = flameTick(ember, T, dt, 1, 0, 0); emberGlow.material.opacity = (0.45 + 0.12 * ek) * (1 + ember.pop * 0.5);
    // candles
    let litCount = 0;
    CANDLES.forEach((C, i) => { if (!C.g.visible) return; const cd = s ? s.candles[i] : null, lit = !!(cd && cd.lit), L = lit ? clamp(cd.life / 100, 0, 1) : 0;
      C.fl.on = lit ? Math.min(1, C.fl.on + dt * 8) : Math.max(0, C.fl.on - dt * 5); if (lit) litCount++;
      let gust = 0, lean = 0; if (live && lit) { const p = candlePos(cd, spin()); s.vents.forEach((v, k) => { if (ventOn(k) && p.x > v.zx && p.x < v.zx + v.zw && p.y > v.zy && p.y < v.zy + v.zh) { gust = 1; lean += leanOf(v.dir, 0) * 1.1; } }); if (L < 0.34) gust = Math.max(gust, (0.34 - L) * 2.2); }
      const fk = flameTick(C.fl, T, dt, lit ? Math.max(0.25, L) : 0.6, lean, gust); C.gl.material.opacity = C.fl.on * (0.18 + 0.2 * L) * fk; });
    if (lamp) lamp.intensity = (open || litCount ? 0.5 : 0) + litCount * 0.12 + 0.05 * Math.sin(T * 9);
    // vents: ribbons, draught field, streaks
    for (const [k, V] of Object.entries(VENT3)) { if (!V.vg.visible) continue; const idx = s ? s.vkeys.indexOf(k) : -1, tgt = live && idx >= 0 ? ventStir(idx) : 0; V.amt += (tgt - V.amt) * Math.min(1, dt * 4);
      const a = V.amt, v = V.v; V.zone.material.opacity = a * 0.22 + (live ? 0.03 : 0);
      for (const R of V.ribs) { R.pv.rotation.y = V.idleA + (V.blowA - V.idleA) * Math.min(1, a * 1.15); const pa = R.geo.attributes.position, arr = pa.array; for (let j = 0; j < arr.length; j += 3) { const u = arr[j] / 0.17 + 0, b = R.base; const f = clamp(b[j] / 0.17, 0, 1); arr[j] = b[j] * (0.55 + 0.45 * a); arr[j + 2] = b[j + 2] + Math.sin(f * 5.5 - T * (6 + a * 10) + R.i * 2) * 0.012 * f * (0.25 + a); arr[j + 1] = b[j + 1] - (1 - a) * f * 0.02; void u; } pa.needsUpdate = true; }
      for (const st of V.streaks) { st.l = (st.l + dt * (0.5 + a * 0.6) * (0.8 + st.u * 0.4)) % 1; const along = st.l, across = (st.u + 0.1) % 1; let px, py;
        if (V.side) { px = v.dir > 0 ? v.zx + along * v.zw : v.zx + v.zw - along * v.zw; py = v.zy + 3 + across * (v.zh - 6); } else { px = v.zx + 3 + across * (v.zw - 6); py = v.zy + v.zh - along * v.zh; }
        const [wx, wz] = toW(px, py); st.m.position.x = wx; st.m.position.z = wz; st.m.material.opacity = a * 0.4 * Math.sin(along * Math.PI); } }
    // bells
    bells.forEach((b, i) => { const on = s && (s.lightings % TOLL_EVERY) > i && open; b.m.material = on ? bellOn : bellOff; b.ring = Math.max(0, b.ring - dt * 1.2); b.g.rotation.z = Math.sin(T * 22 + i) * 0.35 * b.ring; b.g.rotation.x = Math.cos(T * 19 + i) * 0.2 * b.ring; });
    // the taper
    taper.visible = !!live && openK > 0.5;
    if (live) { const [tx2, tz2] = toW(s.taper.x, s.taper.y); taper.position.x += (tx2 - taper.position.x) * Math.min(1, dt * 26); taper.position.z += (tz2 - taper.position.z) * Math.min(1, dt * 26); taper.position.y = YS + 0.12 + (s.held ? 0.02 : 0) + Math.sin(T * 1.7) * 0.004;
      const len = 0.1 + (s.wax / 100) * 0.21; stick.scale.y = len; stick.position.y = 0.01 + len / 2; collar.position.y = 0.01 + len * 0.72;
      tFlame.on = s.lit ? Math.min(1, tFlame.on + dt * 9) : Math.max(0, tFlame.on - dt * 6); vel[0] *= Math.pow(0.02, dt); vel[1] *= Math.pow(0.02, dt);
      const fl = s.flame / 100, draught = s.lit && inVent(s.taper.x, s.taper.y); flameTick(tFlame, T, dt, Math.max(0.2, fl), -leanOf(vel[0], vel[1]) / 140, draught ? 1 : fl < 0.5 ? (0.5 - fl) * 1.6 : 0); }
    else { tFlame.on = 0; flameTick(tFlame, T, dt, 0, 0, 0); }
    // guide ring: the ember until the taper is lit, then (first rite) the nearest unlit candle
    let gx = null, gz = null; if (live && !overlay && !s.done && s.card <= 0 && s.timeLeft > 0) { if (!s.lit) { gx = ax; gz = az; } else if (s.round % 4 === 0 && s.lightings === 0) { let bi = -1, bd = 1e9; s.candles.forEach((cd, i) => { if (cd.lit) return; const p = candlePos(cd, spin()), d = Math.hypot(p.x - s.taper.x, p.y - s.taper.y); if (d < bd) { bd = d; bi = i; } }); if (bi >= 0) [gx, gz] = candleW(bi); } }
    if (gx != null) { guide.position.x = gx; guide.position.z = gz; const q = 0.5 + 0.5 * Math.sin(T * 5); guide.scale.setScalar(1.25 + q * 0.35); guide.material.opacity = 0.55 + q * 0.4; } else guide.material.opacity = Math.max(0, guide.material.opacity - dt * 3);
    // all-lit ring + smoke
    if (burstT >= 0) { burstT += dt; const k = burstT / 1.6; burst.scale.setScalar(0.1 + k * 1.6); burst.material.opacity = Math.max(0, 1 - k) * 0.9; if (k >= 1) burstT = -1; CANDLES.forEach(C => { if (k < 0.5) C.fl.pop = Math.max(C.fl.pop, 0.5 * (1 - k * 2)); }); }
    for (const p of smoke) { if (p.t > 2.2) { p.sp.visible = false; continue; } p.t += dt; if (p.t < 0) { p.sp.material.opacity = 0; continue; } const k = p.t / 2.2; p.sp.position.y += dt * 0.16; p.sp.position.x += p.vx * dt + Math.sin(p.t * 3 + p.vz * 50) * 0.002; p.sp.position.z += p.vz * dt; p.sp.scale.setScalar(0.04 + k * 0.22); p.sp.material.opacity = (1 - k) * 0.42 * Math.min(1, p.t * 6); } }

  // ---- idle: after you leave, the flames you lit burn down slowly, one by one
  function idleTick(dt) { if (!s || open) return; for (let i = 0; i < s.candles.length; i++) { const cd = s.candles[i]; if (!cd.lit) continue; cd.life -= dt * (1.1 + i * 0.13); if (cd.life <= 0) { cd.lit = false; cd.life = 0; snuff(i); } } }
  function gameTick(dt) { const r = s.rite; s.t += dt; speed *= Math.pow(0.1, dt);
    if (s.lit) { let flame = s.flame; s.wax = Math.max(0, s.wax - r.wax * dt); const dr = inVent(s.taper.x, s.taper.y);
      if (dr) flame -= r.drain * dt; else if (speed > r.limit) flame -= (speed - r.limit) * 0.5 * dt; else if (speed < r.limit * 0.45) flame = Math.min(100, flame + 16 * dt);
      const [tx2, tz2] = [taper.position.x, taper.position.z];
      if (s.wax <= 0) { sfx('out'); s.lit = false; s.flame = 0; s.wax = 0; s.spent++; puff(tx2, taper.position.y + 0.03, tz2); }
      else if (flame <= 0) { sfx('out'); s.lit = false; s.flame = 0; s.guttered++; puff(tx2, taper.position.y + 0.03, tz2); } else s.flame = clamp(flame, 0, 100); }
    const sp = spin(); let blown = 0;
    s.candles.forEach((cd, i) => { if (!cd.lit) return; const p = candlePos(cd, sp), dr = inVent(p.x, p.y); cd.life -= r.wane * dt + (dr ? CANDLE_SNUFF * dt : 0); if (cd.life <= 0) { cd.lit = false; cd.life = 0; if (dr) blown++; snuff(i); } });
    if (blown) { sfx('out'); s.blown += blown; } const ln = litN(); if (ln > s.peak) s.peak = ln;
    s.vents.forEach((v, i) => { const on = ventOn(i); if (on && !wasOn[i]) sfx('breath'); wasOn[i] = on; });
    s.timeLeft -= dt; if (s.timeLeft <= 0) { s.timeLeft = 0; s.done = true; s.outcome = 'time'; s.held = false; sfx('time'); const me = s; setTimeout(() => { if (s === me && open) finish(); }, 900); } }
  const OFF = () => lastType === 'touch' || lastType === 'pen' ? (portrait() ? [11, 0] : [0, -11]) : [0, 0];

  return {
    title: 'SHRINE CANDLES', where: 'Temple of Gaya · KEEPER OPA', W: 200, H: 140, showStats: true,
    surface: { c: new THREE.Vector3(OX + at.x, YS, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: PW, h: PH, maxD: 6.2, maxY: roomH - 0.6 },
    stand: { x: OX + at.x, z: at.z + stZ, face: Math.PI }, _s: () => s,
    idle(dt, T) { if (!open) { idleTick(dt); render3D(dt, T); } },
    begin() { open = true; ending = false; overlay = 'intro'; s = fresh(save.stat('dsfShrineRound', 0) % 4); setRite(); speed = 0; vel = [0, 0]; draw(); setTimeout(() => { if (open) sfx('open'); }, 300); },
    end() { ending = true; killMusic(); if (s) { save.setStat('dsfShrineRound', s.outcome === 'all' ? s.round + 1 : s.round); s.held = false; } open = false; },
    tick(dt, T, fly) { if (!open) return; if (fly > 0.85 && !ending && overlay === null) music(); else if (overlay !== null || ending) killMusic();
      if (s && !overlay && !s.done && fly > 0.85) { if (s.card > 0) s.card = Math.max(0, s.card - dt); else gameTick(dt); }
      render3D(dt, T); draw(); },
    down(x, y) { if (overlay || !s || s.done || s.card > 0) return; const o = OFF(); sfx('take'); lastPt = null; s.held = true; place({ x: x + o[0], y: y + o[1] }); },
    move(x, y) { if (overlay || !s || s.done || !s.held) return; const o = OFF(), p = { x: x + o[0], y: y + o[1] }, now = performance.now();
      if (lastPt) { const dtt = Math.max(0.008, (now - lastPt.t) / 1000), vx = (p.x - lastPt.x) / dtt, vy = (p.y - lastPt.y) / dtt, v = Math.hypot(vx, vy); speed = Math.max(speed, v); vel[0] += (vx * U * 66 - vel[0]) * 0.4; vel[1] += (vy * U * 66 - vel[1]) * 0.4; }
      lastPt = { x: p.x, y: p.y, t: now }; place(p); },
    up() { lastPt = null; if (s) s.held = false; },
    hud() { if (overlay === 'intro') return { card: { kicker: 'Temple of Gaya · Keeper Opa', title: 'Shrine Candles', body: 'Touch the ember to light your taper, then touch each candle. Move gently and keep out of the draughts. Every fourth flame you light, the bell takes one back.', buttons: ['LIGHT THE SHRINE', 'NOT NOW'] } };
      if (overlay === 'card' && cardInfo) return { card: cardInfo }; if (!s) return {};
      const tot = s.candles.length, ln = litN(), word = !s.lit ? (s.wax <= 0 ? 'SPENT' : 'OUT') : s.flame > 66 ? 'STEADY' : s.flame > 33 ? 'LOW' : 'GUTTERING';
      return { showStats: true, stats: [['Lit', ln + ' / ' + tot, ln === tot ? '#8fe38f' : null], ['Time', Math.ceil(s.timeLeft) + 's', s.timeLeft < s.total * 0.15 ? red : s.timeLeft < s.total * 0.33 ? '#ffb347' : null], ['Taper', word, !s.lit ? '#a8a6a0' : s.flame > 66 ? '#8fe38f' : s.flame > 33 ? '#ffb347' : red]] }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0) { tone(660, 0.12, 0.04, 'triangle'); overlay = null; drawKey = ''; } else return 'leave'; return; }
      if (overlay === 'card') { if (i === 0) { s = fresh(s.outcome === 'time' ? s.round : s.round + 1); setRite(); overlay = null; cardInfo = null; speed = 0; } else return 'leave'; } },
  };
}
