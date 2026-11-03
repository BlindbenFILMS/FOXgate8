// s331 ROB PLANT CAM: the camera shots for Rob walking to the Pearl Sail doors and planting the door-buster charge.
// Shared by the game (worlds/meru2-rob.js camShot) and Plant Cam Workshop.dc.html → localStorage rob.plantCam.v1.
// Coordinates are the DOOR FRAME: o = metres out from the doors, sd = metres sideways (+ = the kiosk side), h = metres above the ground.
// A shot runs t0..t1 seconds into the plant beat (0..PLANT_T); the WALK shot covers Rob walking up (phase 'toDoor').
// Each shot moves from FROM to TO (ease); look 'rob' = follow Rob at lookH; 'charge' = the device. blend = seconds to blend in (0 = cut).
export const PLANT_CAM_KEY = 'rob.plantCam.v1';
export const PLANT_T = 5.6;
export const PLANT_BEATS = [[0, 'Rob lifts the charge'], [0.7, 'moves it to the door'], [1.7, 'CLANK: on the door'], [2.4, 'paw comes in'], [3.15, 'presses the button'], [3.3, 'timer starts 0:10'], [5.6, 'GET CLEAR line']];
export const PLANT_DEFAULT = { port: 1.25, shots: [   // s338: Ben's workshop shots baked in
  {key: 'walk', name: 'WALKS TO THE DOOR', phase: 'toDoor', from: {p: [3.4, -5.35, 0.1], l: 'rob'}, to: {p: [3.4, -0.2, 1.6], l: 'rob'}, lookH: 1.98, fov: 28, blend: 0.6, hideRob: false},
  {key: 'press', name: 'PRESSES IT ON', v: 6, phase: 'plant', t0: 0, t1: 2.4, from: {p: [1.5, 2.1, 1.6], l: [0.27, 0.62, 1.25]}, to: {p: [1.15, 1.5, 1.45], l: [0.27, -0.05, 1.3]}, fov: 18, blend: 0, hideRob: true},
  {key: 'button', name: 'BUTTON + TIMER', phase: 'plant', t0: 2.4, t1: 4.35, from: {p: [2.3, 1, 1.55], l: 'charge'}, to: {p: [1.95, 0.25, 1.48], l: 'charge'}, fov: 15, blend: 0, hideRob: true}] };
const clone = o => JSON.parse(JSON.stringify(o));
// s336: the old PRESS shot sat 3 m to the side, where the Pearl Sail's round entrance pod filled half the frame; a saved copy of that exact shot is upgraded
const OLD_PRESS = '[1.3,-3,1.45]', OLD_PRESS2 = '[3.2,-1.3,1.65]', OLD_PRESS3 = '[1.3,-2.8,1.55]', OLD_PRESS4 = '[2.4,-0.6,1.7]', OLD_PRESS5 = '[1.6,-1.6,1.6]'; const PRESS_V = 6;
export function loadPlantCam() { try { const s = JSON.parse(localStorage.getItem(PLANT_CAM_KEY) || 'null'); if (s && Array.isArray(s.shots) && s.shots.length) { s.shots = s.shots.map(q => (q.key === 'press' && ((q.v || 0) < PRESS_V && JSON.stringify(q.from.p) === '[1.5,2.1,1.6]') ? clone(PLANT_DEFAULT.shots[1]) : q.key === 'press' && ((JSON.stringify(q.from.p) === OLD_PRESS && JSON.stringify((q.to || q.from).p) === OLD_PRESS) || JSON.stringify(q.from.p) === OLD_PRESS2 || JSON.stringify(q.from.p) === OLD_PRESS3 || JSON.stringify(q.from.p) === OLD_PRESS4 || JSON.stringify(q.from.p) === OLD_PRESS5) ? clone(PLANT_DEFAULT.shots[1]) : q.key === 'button' && ['[0.95,-0.42,1.4]', '[0.95,0.42,1.4]', '[1.35,0.2,1.45]'].includes(JSON.stringify(q.from.p)) ? clone(PLANT_DEFAULT.shots[2]) : q)); return { ...clone(PLANT_DEFAULT), ...s }; } } catch (e) {} return clone(PLANT_DEFAULT); }
export function savePlantCam(c) { try { localStorage.setItem(PLANT_CAM_KEY, JSON.stringify(c)); } catch (e) {} }
export const CHARGE_AT = [0.27, 0, 1.3];   // the charge on the doors (o, sd, h)
const sm = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
// the shot for a phase + time; resolve(l) turns 'rob' / 'charge' into [o, sd, h]
export function plantShot(cfg, phase, t, port, resolve) {
  const list = cfg.shots.filter(s => s.phase === phase); if (!list.length) return null;
  let s = list[0]; if (phase === 'plant') { s = list.filter(q => (q.t0 || 0) <= t + 1e-6).sort((a, b) => (b.t0 || 0) - (a.t0 || 0))[0] || list[0]; }
  const k = phase === 'plant' ? sm((t - (s.t0 || 0)) / Math.max(0.05, (s.t1 ?? PLANT_T) - (s.t0 || 0))) : sm(t / 3);
  const L = v => (Array.isArray(v) ? v : resolve(v, s)), a = s.from, b = s.to || s.from, lp = (x, y) => x.map((v, i) => v + (y[i] - v) * k);
  let p = lp(a.p, b.p); const l = lp(L(a.l), L(b.l));
  if (port) { const f = cfg.port || 1; p = p.map((v, i) => l[i] + (v - l[i]) * f); }
  return { key: s.key, p, l, fov: s.fov || 50, blend: s.blend || 0, hideRob: !!s.hideRob };
}
