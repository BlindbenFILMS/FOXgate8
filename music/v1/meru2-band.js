// MERU 2.0 — THE STAGE BAND (Ben): a 4-piece fox band on the Open-Air Stage (x 256, z -21): GUITAR + VOCALS (front left), BASS (front right),
// DRUMS (back centre), KEYS (back right). They play to one beat clock; the music is a synth loop (drums, bass, chords, lead riff) heard
// from the stage: full within 10 m, gone by ~55 m, panned to where the stage is. Swap for a real track later: MERU/audio/manifest.json "stage".
import { PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js';

export function buildBand({ THREE, M, toon, grad, kit, stage, ring, AX, AZ }) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const B = (w, h, d, col, x, y, z, par, o = 0.01) => M(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? toon(col) : col, x, y, z, par, o);
  const C = (r, h, col, x, y, z, par, o = 0.01, n = 16) => M(new THREE.CylinderGeometry(r, r, h, n), typeof col === 'string' ? toon(col) : col, x, y, z, par, o, r);
  const SY = 0.9, BPM = 112, beat = 60 / BPM, PH = matchMedia('(pointer: coarse)').matches;   // phone perf: band of 2 on phones (vox + drums)
  const member = (key, x, z, ry, opt) => { const f = kit.makeFox({ key, crest: '', gear: 'none', mood: 'happy', ...opt }); const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false;
    f.position.set(x, SY, z); f.rotation.y = ry; stage.add(f); return f; };
  const gtr = member('bandVox', -2.4, 1.6, 0.15, { outfit: 'coat', torso: ['#201e1d', '#ec3013', '#ffd23a'], look: { ...PLAYER_MALE, fur: '#e8732a' } });
  const bas = PH ? null : member('bandBass', 2.6, 1.2, -0.2, { outfit: 'vest', torso: ['#1f3a5f', '#f3f2f2', '#e6b45a'], look: { ...PLAYER_FEMALE, fur: '#d9733a' } });
  const drm = member('bandDrums', 0, -2.6, 0, { outfit: 'tee', torso: ['#c42d3c', '#f3ecdf', '#201e1d'], look: { ...PLAYER_MALE, fur: '#c96a2a' } });
  const key = PH ? null : member('bandKeys', 3.4, -1.9, -0.45, { outfit: 'dress', torso: ['#7c3aed', '#f3ecdf', '#ffd23a'], look: { ...PLAYER_FEMALE, fur: '#f08a3c' } });
  // instruments
  const guitar = (f, body, neck) => { const g = new THREE.Group(); g.position.set(0.05, 0.95, 0.28); g.rotation.z = 0.55; f.add(g);
    const b = C(0.22, 0.08, body, 0, 0, 0, g, 0.008); b.rotation.x = Math.PI / 2; b.scale.set(1, 1, 1.25); B(0.06, 0.62, 0.04, neck, 0, 0.42, 0, g, 0.004); B(0.1, 0.12, 0.05, '#201e1d', 0, 0.76, 0, g, 0); return g; };
  const G1 = guitar(gtr, '#ec3013', '#201e1d'), G2 = bas ? guitar(bas, '#f3ecdf', '#6b4a2a') : null; if (G2) G2.scale.set(1, 1.2, 1);
  { const m = new THREE.Group(); m.position.set(-2.25, SY, 2.25); stage.add(m); C(0.02, 1.45, '#201e1d', 0, 0.72, 0, m, 0, 6); C(0.2, 0.03, '#201e1d', 0, 0.02, 0, m, 0, 12); const mic = C(0.04, 0.12, '#9aa0a6', 0, 1.47, -0.08, m, 0, 8); mic.rotation.x = 0.9; }
  const kitG = new THREE.Group(); kitG.position.set(0, SY, -1.95); stage.add(kitG); const cym = [];
  { const kick = C(0.34, 0.32, '#f3ecdf', 0, 0.34, 0, kitG, 0.012); kick.rotation.x = Math.PI / 2; const face = C(0.3, 0.33, '#ec3013', 0, 0.34, 0.001, kitG, 0); face.rotation.x = Math.PI / 2;
    C(0.17, 0.12, '#f3ecdf', -0.42, 0.7, -0.1, kitG, 0.008); C(0.15, 0.13, '#f3ecdf', 0.18, 0.86, -0.05, kitG, 0.008); C(0.2, 0.22, '#f3ecdf', 0.5, 0.52, -0.2, kitG, 0.01);
    for (const [x, y] of [[-0.7, 1.15], [0.75, 1.3]]) { C(0.012, y, '#9aa0a6', x, y / 2, -0.1, kitG, 0, 6); const c = C(0.24, 0.015, '#e6b45a', x, y, -0.1, kitG, 0, 16); cym.push(c); }
    C(0.25, 0.42, '#201e1d', 0, 0.21, -0.75, kitG, 0.008); }
  { const kg = new THREE.Group(); kg.position.set(3.2, SY, -1.4); kg.rotation.y = -0.45 + Math.PI; stage.add(kg); for (const s of [-1, 1]) B(0.04, 0.75, 0.04, '#201e1d', s * 0.45, 0.38, 0, kg, 0);
    B(1.1, 0.07, 0.32, '#201e1d', 0, 0.78, 0, kg, 0.006); for (let i = 0; i < 14; i++) B(0.065, 0.02, 0.18, '#f8fafc', -0.46 + i * 0.071, 0.825, 0.05, kg, 0); }
  for (const [x, z] of PH ? [[-2.4, 1.6], [0, -2.6]] : [[-2.4, 1.6], [2.6, 1.2], [0, -2.6], [3.4, -1.9]]) ring(AX + x, AZ + z, 0.4);
  // ---------- the music: a small synth band, scheduled ahead on the audio clock ----------
  const CH = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], BASS = [36, 31, 33, 29];   // C · G · Am · F
  const RIFF = [72, -1, 76, 79, 76, -1, 74, 72, 74, -1, 71, 67, 69, -1, 72, -1];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  let A = null, step = 0, nextT = 0, lvl = 0, hit = { kick: 0, snare: 0, hat: 0 };
  function build(ac) { const out = ac.createGain(); out.gain.value = 0; const pan = ac.createStereoPanner ? ac.createStereoPanner() : null; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    out.connect(lp); (pan ? (lp.connect(pan), pan) : lp).connect(ac.destination); const nb = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    A = { ac, out, pan, lp, noise: nb }; nextT = ac.currentTime + 0.1; }
  const env = (g, t, a, peak, dec) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); };
  function tone(type, f, t, dur, peak, cut) { const { ac, out } = A, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; let n = o;
    if (cut) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; o.connect(fl); n = fl; } n.connect(g); g.connect(out); env(g, t, 0.008, peak, dur); o.start(t); o.stop(t + dur + 0.05); }
  function noise(t, dur, peak, type, f) { const { ac, out, noise: nb } = A, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; fl.type = type; fl.frequency.value = f; s.connect(fl); fl.connect(g); g.connect(out); env(g, t, 0.002, peak, dur); s.start(t); s.stop(t + dur + 0.05); }
  function kick(t) { const { ac, out } = A, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); o.connect(g); g.connect(out); env(g, t, 0.004, 0.9, 0.22); o.start(t); o.stop(t + 0.3); }
  function schedule(s, t) { const e = s % 8, bar = Math.floor(s / 8) % 4, eighth = beat / 2;
    if (e === 0 || e === 4 || e === 5 && bar % 2) kick(t); if (e === 2 || e === 6) noise(t, 0.16, 0.35, 'bandpass', 1800); noise(t, 0.04, e % 2 ? 0.06 : 0.1, 'highpass', 7000);
    tone('triangle', hz(BASS[bar] + (e === 3 || e === 7 ? 12 : 0)), t, eighth * 0.9, 0.32, 900);
    if (e === 0 || e === 3 || e === 6) for (const n of CH[bar]) tone('square', hz(n), t, eighth * (e === 6 ? 1.8 : 1.4), 0.035, 2200);
    const r = RIFF[s % 16]; if (r > 0 && Math.floor(s / 32) % 2) tone('sawtooth', hz(r), t, eighth * 0.85, 0.06, 2600);
    hit = { kick: e === 0 || e === 4 ? t : hit.kick, snare: e === 2 || e === 6 ? t : hit.snare, hat: t }; }
  // per frame: the music (if there is a context) + the band moving to the same clock
  let T = 0;
  function tick(dt, { P, ctx, muted, camYaw, visible }) { T += dt;
    const d = P ? Math.hypot(P.x - AX, P.z - AZ) : 999, want = visible && !muted ? Math.pow(clamp(1 - (d - 10) / 45, 0, 1), 1.6) * 0.32 : 0;
    if (ctx && ctx.state === 'running' && (want > 0.001 || A)) { if (!A || A.ac !== ctx) build(ctx);
      lvl += (want - lvl) * Math.min(1, dt * 2); A.out.gain.setTargetAtTime(lvl, ctx.currentTime, 0.05); A.lp.frequency.setTargetAtTime(1200 + 8000 * clamp(1 - d / 60, 0, 1), ctx.currentTime, 0.1);
      if (A.pan && P) { const a = Math.atan2(AX - P.x, AZ - P.z) - (camYaw + Math.PI); A.pan.pan.setTargetAtTime(clamp(-Math.sin(a) * 0.8, -0.8, 0.8), ctx.currentTime, 0.1); }
      if (ctx.currentTime > nextT + 1) nextT = ctx.currentTime + 0.05;
      if (lvl > 0.002) while (nextT < ctx.currentTime + 0.6) { schedule(step++, nextT); nextT += beat / 2; } else nextT = ctx.currentTime + 0.05; }
    if (!visible) return;
    const ph = (A ? (A.ac.currentTime % (beat * 2)) / (beat * 2) : (T % (beat * 2)) / (beat * 2)) * Math.PI * 4;   // two bobs a bar-half
    for (const f of [gtr, bas, drm, key]) { if (!f) continue; if (kit.animFox) kit.animFox(f, dt, 0); }
    const bob = Math.abs(Math.sin(ph)) * 0.05; gtr.position.y = SY + bob; if (bas) bas.position.y = SY + Math.abs(Math.sin(ph + 0.6)) * 0.05; if (key) key.position.y = SY + Math.abs(Math.sin(ph + 1.2)) * 0.03;
    const arm = (f, i) => f && f.userData.P && f.userData.P.arms ? f.userData.P.arms[i] : null;
    const strum = Math.sin(ph * 2) * 0.35; let a;
    if ((a = arm(gtr, 1))) a.rotation.x = -0.9 + strum; if ((a = arm(gtr, 0))) a.rotation.x = -1.3;
    if ((a = arm(bas, 1))) a.rotation.x = -0.9 + Math.sin(ph) * 0.25; if ((a = arm(bas, 0))) a.rotation.x = -1.3;
    if ((a = arm(drm, 0))) a.rotation.x = -1.1 + Math.max(0, Math.sin(ph * 2)) * 0.7; if ((a = arm(drm, 1))) a.rotation.x = -1.1 + Math.max(0, Math.sin(ph * 2 + Math.PI)) * 0.7;
    if ((a = arm(key, 0))) a.rotation.x = -1.0 + Math.sin(ph * 2) * 0.12; if ((a = arm(key, 1))) a.rotation.x = -1.0 + Math.sin(ph * 2 + 1.7) * 0.12;
    cym.forEach((c, i) => { c.rotation.x = Math.sin(T * 9 + i) * 0.08; }); }
  return { tick, members: [gtr, bas, drm, key].filter(Boolean) };
}
