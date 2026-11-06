// LIGHTHOUSE OF HOPE: the drawn props for "Riddles of the lighthouse".
// A little sailboat in the painting's own colours (cream sails like the hair of clouds, a dark hull with a gold rim,
// a warm lantern at the bow), and its soft lantern glow. Drawn once, shared by all six ships.
import * as K from './kit.js';

// The boat: 256 × 256, the waterline at y = 200 (so the ship's group puts the waterline exactly on the sea).
export const WATERLINE = 200 / 256;
export const shipTex = K.canvasTex(256, 256, (g) => {
  const cream = '#efe3c2', creamDk = '#cdbb8e', gold = '#e2b65a', ink = '#14171a';
  g.lineJoin = 'round'; g.lineCap = 'round';
  // mast
  g.strokeStyle = ink; g.lineWidth = 7; g.beginPath(); g.moveTo(124, 196); g.lineTo(124, 30); g.stroke();
  // pennant
  g.fillStyle = gold; g.beginPath(); g.moveTo(124, 30); g.lineTo(156, 38); g.lineTo(124, 46); g.closePath(); g.fill();
  // main sail (a soft curved triangle) with lines like the painting's clouds
  const main = new Path2D(); main.moveTo(130, 42); main.quadraticCurveTo(196, 110, 206, 176); main.lineTo(130, 176); main.closePath();
  const sg = g.createLinearGradient(130, 40, 210, 176); sg.addColorStop(0, cream); sg.addColorStop(1, creamDk);
  g.fillStyle = sg; g.fill(main); g.strokeStyle = ink; g.lineWidth = 5; g.stroke(main);
  g.save(); g.clip(main); g.strokeStyle = 'rgba(150,120,70,.45)'; g.lineWidth = 2.5;
  for (let y = 70; y < 176; y += 18) { g.beginPath(); g.moveTo(128, y); g.quadraticCurveTo(170, y - 10, 212, y + 4); g.stroke(); }
  g.restore();
  // jib (the front sail)
  const jib = new Path2D(); jib.moveTo(118, 56); jib.quadraticCurveTo(84, 120, 58, 176); jib.lineTo(118, 176); jib.closePath();
  const jg = g.createLinearGradient(118, 56, 58, 176); jg.addColorStop(0, cream); jg.addColorStop(1, creamDk);
  g.fillStyle = jg; g.fill(jib); g.strokeStyle = ink; g.lineWidth = 5; g.stroke(jib);
  // hull: dark, with a gold rim along the top, sitting on the waterline
  const hull = new Path2D(); hull.moveTo(26, 178); hull.lineTo(236, 178); hull.quadraticCurveTo(218, 206, 196, 210); hull.lineTo(62, 210); hull.quadraticCurveTo(40, 204, 26, 178); hull.closePath();
  g.fillStyle = ink; g.fill(hull);
  g.strokeStyle = gold; g.lineWidth = 6; g.beginPath(); g.moveTo(28, 180); g.lineTo(234, 180); g.stroke();
  g.strokeStyle = 'rgba(226,182,90,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(52, 194); g.lineTo(212, 194); g.stroke();
  // the lantern at the bow
  g.fillStyle = ink; g.fillRect(36, 158, 16, 20);
  g.fillStyle = '#ffd77a'; g.fillRect(39, 161, 10, 13);
});
// a warm, soft glow (for the lantern and the light on the water)
export const glowTex = K.canvasTex(128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,236,170,1)'); r.addColorStop(0.25, 'rgba(255,214,120,.6)'); r.addColorStop(1, 'rgba(255,200,100,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
});
// the ship's gold reflection on the water: a short wavy streak
export const wakeTex = K.canvasTex(256, 64, (g) => {
  for (let i = 0; i < 5; i++) {
    const y = 10 + i * 11, w = 200 - i * 34, a = 0.75 - i * 0.13;
    const gr = g.createLinearGradient(128 - w / 2, 0, 128 + w / 2, 0);
    gr.addColorStop(0, 'rgba(255,210,120,0)'); gr.addColorStop(0.5, `rgba(255,214,130,${a})`); gr.addColorStop(1, 'rgba(255,210,120,0)');
    g.fillStyle = gr; g.fillRect(128 - w / 2, y, w, 5);
  }
});
