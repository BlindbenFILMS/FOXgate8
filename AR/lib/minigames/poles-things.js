// TELEPHONE POLES: the drawn props for "Straight as an arrow".
// Craig's old pickup seen from behind, in the painting's colours (rust-red body, cream cab roof, sky in the back window,
// chrome bumper), plus its tail-light glow and the headlight haze. Drawn once.
import * as K from './kit.js';

// 320 × 200; the tyres touch the road at y = 186
export const TRUCK_ASPECT = 200 / 320;
export const truckTex = K.canvasTex(320, 200, (g) => {
  const rust = '#b4472a', rustDk = '#7c2c1c', cream = '#f1dfa8', ink = '#1b1416', chrome = '#d9d6cc';
  g.lineJoin = 'round';
  // shadow on the road
  g.fillStyle = 'rgba(10,12,20,.45)'; g.beginPath(); g.ellipse(160, 188, 150, 11, 0, 0, Math.PI * 2); g.fill();
  // tyres
  g.fillStyle = ink; g.fillRect(34, 150, 44, 38); g.fillRect(242, 150, 44, 38);
  // cab (behind the bed): cream roof, a back window full of evening sky
  const cab = new Path2D(); cab.moveTo(82, 96); cab.lineTo(94, 34); cab.quadraticCurveTo(160, 24, 226, 34); cab.lineTo(238, 96); cab.closePath();
  g.fillStyle = cream; g.fill(cab); g.strokeStyle = ink; g.lineWidth = 5; g.stroke(cab);
  const win = new Path2D(); win.moveTo(102, 88); win.lineTo(110, 46); win.quadraticCurveTo(160, 38, 210, 46); win.lineTo(218, 88); win.closePath();
  const sky = g.createLinearGradient(0, 44, 0, 90); sky.addColorStop(0, '#2f7c78'); sky.addColorStop(0.55, '#7fb79a'); sky.addColorStop(1, '#f3d78c');
  g.fillStyle = sky; g.fill(win); g.strokeStyle = ink; g.lineWidth = 4; g.stroke(win);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 5; g.beginPath(); g.moveTo(124, 84); g.lineTo(140, 50); g.stroke();
  // two heads in the cab: Craig and his son
  g.fillStyle = ink; g.beginPath(); g.arc(136, 82, 13, Math.PI, 0); g.fill(); g.fillRect(123, 82, 26, 8);
  g.beginPath(); g.arc(186, 84, 11, Math.PI, 0); g.fill(); g.fillRect(175, 84, 22, 6);
  // the bed and tailgate
  const bed = new Path2D(); bed.moveTo(26, 96); bed.lineTo(294, 96); bed.lineTo(298, 160); bed.lineTo(22, 160); bed.closePath();
  const bg = g.createLinearGradient(0, 96, 0, 160); bg.addColorStop(0, rust); bg.addColorStop(1, rustDk);
  g.fillStyle = bg; g.fill(bed); g.strokeStyle = ink; g.lineWidth = 5; g.stroke(bed);
  g.strokeStyle = 'rgba(255,220,170,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 102); g.lineTo(290, 102); g.stroke();
  g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(70, 110, 180, 38);
  // tail lights (the glow sprites sit on top of these)
  g.fillStyle = '#5c0f0a'; g.fillRect(30, 108, 22, 40); g.fillRect(268, 108, 22, 40);
  g.fillStyle = '#e8402a'; g.fillRect(33, 111, 16, 22); g.fillRect(271, 111, 16, 22);
  // chrome bumper and plate
  g.fillStyle = chrome; g.fillRect(16, 160, 288, 16); g.strokeStyle = ink; g.lineWidth = 4; g.strokeRect(16, 160, 288, 16);
  g.fillStyle = cream; g.fillRect(136, 134, 48, 22); g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(136, 134, 48, 22);
});
// red tail-light glow
export const tailTex = K.canvasTex(64, 64, (g) => {
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,90,60,1)'); r.addColorStop(0.35, 'rgba(255,40,20,.6)'); r.addColorStop(1, 'rgba(255,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
});
