// 8 GATES — MERU CASINO CARD ART (shared by Five Card Stud and the Card Workshop)
// One style object drives every colour, word and switch on the cards. The Card Workshop edits it and saves it to
// localStorage ('meruStud.cardStyle') and/or exports it as minigames/meru/stud-cards.json for everyone.
// NO STATIC IMPORTS (canvas-safe): the caller hands in THREE and the fox kit.

export const CARD_STYLE_KEY = 'meruStud.cardStyle';
export const CARD_STYLE_FILE = 'minigames/meru/stud-cards.json';
export const DEFAULT_CARD_STYLE = {
  v: 1,
  back: { top: '#3577e8', mid: '#1f52bd', bottom: '#13307e', gold: '#e6b45a', goldLight: '#ffd98a', medallion: '#0a1c52', medallionLight: '#3263d6', halo: '#7dd3fc', jewel: '#c42d3c',
    ribbonText: '#0b1f57', topText: '8  G A T E S', bottomText: 'M E R U   C A S I N O', edge: '#0b1f57',
    pattern: true, rays: true, sparkles: true, suits: true, sheen: true, foxSize: 44,
    fox: { fur: '#f2741f', shade: '#d9560f', light: '#f79a4a', muzzle: '#fff7ec', ink: '#1a1626', outline: '#e6b45a' } },
  paper: { top: '#fffdf7', bottom: '#f1ead9', red: '#c42d3c', black: '#1a1626', edge: '#1a1626', tint: true },
  faces: { redBg: '#fbe3dc', blackBg: '#eceef2', bar: '#e6b45a', barText: '#1a1626', crest: true, fur: '#f2741f',
    names: { J: 'FOX KNAVE', Q: 'FOX QUEEN', K: 'FOX KING' },
    J: { red: { top: '#ffffff', main: '#f4f4f6', trim: '#c42d3c' }, black: { top: '#ffffff', main: '#f4f4f6', trim: '#1a1626' } },
    Q: { red: { top: '#ffffff', main: '#c42d3c', trim: '#8a1f2b' }, black: { top: '#ffffff', main: '#2a2a30', trim: '#0d0d10' } },
    K: { red: { top: '#c42d3c', main: '#a3202f', trim: '#6e1520' }, black: { top: '#2a2a30', main: '#18181c', trim: '#0b0b0d' } } },
  shuttle: { sky: '#070a1f', sky2: '#1e2a5a', body: '#ffffff', wing: '#e8edf5', nose: '#1a1626', stripe: '#f2741f', window: '#7dd3fc', flame: '#ffb020', label: 'SHUTTLE', labelColor: '#ffd23a', stars: true },
  anim: { wave: true, wink: true, grin: true, hop: true, every: 5 },
};

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
export function mergeStyle(base, over) { const out = Array.isArray(base) ? base.slice() : { ...base }; if (!isObj(over)) return out; for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? mergeStyle(base[k], v) : v; return out; }
export const cloneStyle = s => JSON.parse(JSON.stringify(s));
export function readSavedStyle() { try { const raw = localStorage.getItem(CARD_STYLE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
export function saveStyle(st) { try { localStorage.setItem(CARD_STYLE_KEY, JSON.stringify(st)); return true; } catch (e) { return false; } }
export function clearSavedStyle() { try { localStorage.removeItem(CARD_STYLE_KEY); } catch (e) {} }
// device copy first (what Ben saved in the workshop), then the repo file, then the defaults
export async function loadCardStyle() {
  const saved = readSavedStyle(); if (saved) return mergeStyle(DEFAULT_CARD_STYLE, saved);
  const urls = []; const add = u => { try { const h = new URL(u, location.href).href; if (/^https?:/.test(h) && !urls.includes(h)) urls.push(h); } catch (e) {} };
  try { add(new URL(CARD_STYLE_FILE, document.baseURI).href); } catch (e) {} try { add(location.origin + '/project/' + CARD_STYLE_FILE); add(location.origin + '/' + CARD_STYLE_FILE); } catch (e) {}
  for (const u of urls) { try { const r = await fetch(u, { cache: 'no-store' }); if (r.ok) return mergeStyle(DEFAULT_CARD_STYLE, await r.json()); } catch (e) {} }
  return cloneStyle(DEFAULT_CARD_STYLE);
}

const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const RANK_CH = r => r === 14 ? 'A' : r === 13 ? 'K' : r === 12 ? 'Q' : r === 11 ? 'J' : String(r);
export const isRed = s => s === 'h' || s === 'd';
const hexA = (hex, a) => { const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const shadeHex = (hex, f) => { const h = hex.replace('#', ''), n = parseInt(h, 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f)))); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); };

export function createCardArt({ THREE, FK, style, RES = 2, FONT = '"Archivo", "Arial Black", Arial, sans-serif', portraits: wantPortraits = true }) {
  let S = mergeStyle(DEFAULT_CARD_STYLE, style || {});
  const CWp = 200, CHp = 280, ART = { x: 70, y: 14, w: 118, h: 252 };
  const PIPS = { 2: [[.5, .12], [.5, .88]], 3: [[.5, .12], [.5, .5], [.5, .88]], 4: [[.25, .12], [.75, .12], [.25, .88], [.75, .88]], 5: [[.25, .12], [.75, .12], [.5, .5], [.25, .88], [.75, .88]],
    6: [[.25, .12], [.75, .12], [.25, .5], [.75, .5], [.25, .88], [.75, .88]], 7: [[.25, .12], [.75, .12], [.5, .31], [.25, .5], [.75, .5], [.25, .88], [.75, .88]],
    8: [[.25, .12], [.75, .12], [.5, .31], [.25, .5], [.75, .5], [.5, .69], [.25, .88], [.75, .88]], 9: [[.25, .12], [.75, .12], [.25, .37], [.75, .37], [.5, .5], [.25, .63], [.75, .63], [.25, .88], [.75, .88]],
    10: [[.25, .12], [.75, .12], [.5, .25], [.25, .37], [.75, .37], [.25, .63], [.75, .63], [.5, .75], [.25, .88], [.75, .88]] };
  const ink = s => isRed(s) ? S.paper.red : S.paper.black;

  function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function suitPath(g, s, x, y, w) {
    g.beginPath();
    if (s === 'h') { g.moveTo(x, y + w * 0.45); g.bezierCurveTo(x - w * 0.78, y - w * 0.02, x - w * 0.42, y - w * 0.62, x, y - w * 0.2); g.bezierCurveTo(x + w * 0.42, y - w * 0.62, x + w * 0.78, y - w * 0.02, x, y + w * 0.45); }
    else if (s === 'd') { g.moveTo(x, y - w * 0.5); g.lineTo(x + w * 0.38, y); g.lineTo(x, y + w * 0.5); g.lineTo(x - w * 0.38, y); g.closePath(); }
    else if (s === 's') { g.moveTo(x, y - w * 0.5); g.bezierCurveTo(x + w * 0.8, y + w * 0.02, x + w * 0.38, y + w * 0.46, x, y + w * 0.16); g.bezierCurveTo(x - w * 0.38, y + w * 0.46, x - w * 0.8, y + w * 0.02, x, y - w * 0.5); g.moveTo(x, y + w * 0.05); g.lineTo(x + w * 0.17, y + w * 0.5); g.lineTo(x - w * 0.17, y + w * 0.5); g.closePath(); }
    else { const r = w * 0.21; g.moveTo(x + r, y - w * 0.25); g.arc(x, y - w * 0.25, r, 0, 7); g.moveTo(x - w * 0.24 + r, y + w * 0.06); g.arc(x - w * 0.24, y + w * 0.06, r, 0, 7); g.moveTo(x + w * 0.24 + r, y + w * 0.06); g.arc(x + w * 0.24, y + w * 0.06, r, 0, 7); g.moveTo(x, y - w * 0.05); g.lineTo(x + w * 0.16, y + w * 0.5); g.lineTo(x - w * 0.16, y + w * 0.5); g.closePath(); }
    g.fill();
  }
  function cardEdge(g, col) { g.strokeStyle = col; g.lineWidth = 3; rrect(g, 1.5, 1.5, CWp - 3, CHp - 3, 13); g.stroke(); g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#000'; rrect(g, 0, 0, CWp, CHp, 14); g.fill(); g.globalCompositeOperation = 'source-over'; }
  const begin = c => { const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, c.width, c.height); g.scale(c.width / CWp, c.height / CHp); return g; };
  const newCanvas = () => { const c = document.createElement('canvas'); c.width = CWp * RES; c.height = CHp * RES; return c; };

  // ---------- the stylised fox-head icon (card backs) ----------
  function foxIcon(g, cx, cy, Sz) {
    const F = S.back.fox, P = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(cx + x * Sz, cy + y * Sz) : g.moveTo(cx + x * Sz, cy + y * Sz)); g.closePath(); };
    const head = [[0, 0.86], [-0.52, 0.3], [-0.98, -0.12], [-0.72, -0.36], [-0.8, -1.02], [-0.24, -0.56], [0.24, -0.56], [0.8, -1.02], [0.72, -0.36], [0.98, -0.12], [0.52, 0.3]];
    g.save(); g.lineJoin = 'round';
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = Sz * 0.12; g.shadowOffsetY = Sz * 0.05; P(head); g.fillStyle = F.fur; g.fill(); g.shadowColor = 'transparent';
    P([[0, -0.56], [0.24, -0.56], [0.8, -1.02], [0.72, -0.36], [0.98, -0.12], [0.52, 0.3], [0, 0.86]]); g.fillStyle = F.shade; g.fill();
    P([[0, -0.56], [-0.24, -0.56], [-0.52, -0.3], [0, -0.05]]); g.fillStyle = F.light; g.fill();
    for (const sx of [-1, 1]) { P([[sx * 0.7, -0.88], [sx * 0.34, -0.56], [sx * 0.66, -0.44]]); g.fillStyle = F.ink; g.fill(); }
    P([[-0.95, -0.13], [-0.3, 0.02], [0, 0.2], [0.3, 0.02], [0.95, -0.13], [0.52, 0.3], [0, 0.86], [-0.52, 0.3]]); g.fillStyle = F.muzzle; g.fill();
    P([[0, 0.2], [0.3, 0.02], [0.95, -0.13], [0.52, 0.3], [0, 0.86]]); g.fillStyle = shadeHex(F.muzzle, 0.91); g.fill();
    for (const sx of [-1, 1]) { g.save(); g.translate(cx + sx * 0.33 * Sz, cy - 0.15 * Sz); g.rotate(sx * 0.42); g.beginPath(); g.ellipse(0, 0, 0.15 * Sz, 0.07 * Sz, 0, 0, 7); g.fillStyle = F.ink; g.fill();
      g.beginPath(); g.arc(sx * 0.03 * Sz, -0.02 * Sz, 0.025 * Sz, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.restore(); }
    P([[-0.13, 0.6], [0.13, 0.6], [0, 0.76]]); g.fillStyle = F.ink; g.fill();
    P(head); g.strokeStyle = F.outline; g.lineWidth = Sz * 0.06; g.stroke(); g.restore();
  }

  // ---------- card back ----------
  function paintBack(c) {
    const g = begin(c), B = S.back, w = CWp, h = CHp, cx = w / 2, cy = h / 2 + 4, GOLD = B.gold, GOLD2 = B.goldLight;
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, B.top); bg.addColorStop(0.5, B.mid); bg.addColorStop(1, B.bottom); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const vg = g.createRadialGradient(cx, cy, 40, cx, cy, 190); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,12,40,0.45)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
    g.save(); rrect(g, 20, 20, w - 40, h - 40, 6); g.clip();
    if (B.pattern) { g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1; for (let i = -h; i < w + h; i += 9) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,0.12)'; for (let y = 24; y < h; y += 18) for (let x = (Math.round(y / 18) % 2) * 9 + 24; x < w; x += 18) { g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 3, y); g.lineTo(x, y + 3); g.lineTo(x - 3, y); g.closePath(); g.fill(); } }
    if (B.rays) { g.translate(cx, cy); for (let i = 0; i < 32; i++) { g.rotate(Math.PI / 16); g.fillStyle = i % 2 ? hexA(B.halo, 0.08) : 'rgba(255,255,255,0.035)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-7, -190); g.lineTo(7, -190); g.closePath(); g.fill(); } }
    g.restore();
    g.strokeStyle = GOLD; g.lineWidth = 5; rrect(g, 9, 9, w - 18, h - 18, 11); g.stroke(); g.strokeStyle = hexA(GOLD2, 0.7); g.lineWidth = 1.2; rrect(g, 16, 16, w - 32, h - 32, 8); g.stroke();
    for (const [x, y, sx, sy] of [[22, 22, 1, 1], [w - 22, 22, -1, 1], [22, h - 22, 1, -1], [w - 22, h - 22, -1, -1]]) {
      g.strokeStyle = GOLD; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y + sy * 26); g.lineTo(x, y); g.lineTo(x + sx * 26, y); g.stroke();
      g.beginPath(); g.moveTo(x + sx * 6, y + sy * 16); g.quadraticCurveTo(x + sx * 6, y + sy * 6, x + sx * 16, y + sy * 6); g.stroke();
      g.fillStyle = B.jewel; g.beginPath(); g.arc(x + sx * 3.5, y + sy * 3.5, 2.6, 0, 7); g.fill(); }
    const ribbon = (y, txt) => { if (!txt) return; g.font = `900 11px ${FONT}`; const rw = Math.max(112, g.measureText(txt).width + 24), x0 = cx - rw / 2; g.fillStyle = shadeHex(GOLD, 0.8);
      for (const sx of [-1, 1]) { const ex = sx < 0 ? x0 - 10 : x0 + rw + 10; g.beginPath(); g.moveTo(sx < 0 ? x0 + 4 : x0 + rw - 4, y - 8); g.lineTo(ex, y - 8); g.lineTo(ex + sx * -5, y); g.lineTo(ex, y + 8); g.lineTo(sx < 0 ? x0 + 4 : x0 + rw - 4, y + 8); g.closePath(); g.fill(); }
      const rg = g.createLinearGradient(0, y - 10, 0, y + 10); rg.addColorStop(0, GOLD2); rg.addColorStop(1, GOLD); g.fillStyle = rg; rrect(g, x0, y - 10, rw, 20, 3); g.fill();
      g.fillStyle = B.ribbonText; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cx, y + 1); };
    ribbon(40, B.topText); ribbon(h - 38, B.bottomText);
    const halo = g.createRadialGradient(cx, cy, 50, cx, cy, 92); halo.addColorStop(0, hexA(B.halo, 0.35)); halo.addColorStop(1, hexA(B.halo, 0)); g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, 92, 0, 7); g.fill();
    const mg = g.createRadialGradient(cx - 10, cy - 18, 6, cx, cy, 64); mg.addColorStop(0, B.medallionLight); mg.addColorStop(1, B.medallion); g.fillStyle = mg; g.beginPath(); g.arc(cx, cy, 63, 0, 7); g.fill();
    const ringG = g.createLinearGradient(cx - 64, cy - 64, cx + 64, cy + 64); ringG.addColorStop(0, GOLD2); ringG.addColorStop(0.5, GOLD); ringG.addColorStop(1, shadeHex(GOLD, 0.72)); g.strokeStyle = ringG; g.lineWidth = 5; g.stroke();
    g.lineWidth = 1.4; g.strokeStyle = GOLD; g.beginPath(); g.arc(cx, cy, 55, 0, 7); g.stroke();
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.fillStyle = i % 2 ? GOLD : GOLD2; g.beginPath(); g.arc(cx + Math.cos(a) * 59.5, cy + Math.sin(a) * 59.5, i % 2 ? 1.2 : 1.9, 0, 7); g.fill(); }
    if (B.suits) { g.fillStyle = GOLD2; [['s', 0, -76], ['h', 76, 0], ['c', 0, 76], ['d', -76, 0]].forEach(([s2, dx, dy]) => suitPath(g, s2, cx + dx, cy + dy, 13)); }
    foxIcon(g, cx, cy + 3, Math.max(20, Math.min(56, +B.foxSize || 44)));
    if (B.sparkles) { g.fillStyle = '#ffffff'; for (const [x, y, r] of [[cx + 40, cy - 46, 2.2], [cx - 46, cy + 40, 1.6], [cx + 52, cy + 30, 1.4]]) { g.globalAlpha = 0.85; g.beginPath(); g.moveTo(x, y - r * 3); g.lineTo(x + r * 0.7, y - r * 0.7); g.lineTo(x + r * 3, y); g.lineTo(x + r * 0.7, y + r * 0.7); g.lineTo(x, y + r * 3); g.lineTo(x - r * 0.7, y + r * 0.7); g.lineTo(x - r * 3, y); g.lineTo(x - r * 0.7, y - r * 0.7); g.closePath(); g.fill(); } g.globalAlpha = 1; }
    if (B.sheen) { const sh = g.createLinearGradient(0, 0, w * 0.7, h * 0.55); sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.45, 'rgba(255,255,255,0.04)'); sh.addColorStop(0.46, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, w, h); }
    cardEdge(g, B.edge);
  }

  // ---------- the shuttle ace ----------
  function drawShuttle(g, s, t = 0) {
    const U = S.shuttle; let up = 0, flame = 1;
    if (t > 0) { if (t < 0.3) { const q = t / 0.3; up = ease(q) * 34; flame = 1 + 1.7 * q; } else { const q = (t - 0.3) / 0.7; up = 34 * (1 - ease(q)) + Math.sin(q * Math.PI * 2) * 4 * (1 - q); flame = 1 + 1.7 * (1 - q) * (1 - q); } }
    const { x, y, w, h } = ART; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, U.sky); sky.addColorStop(1, U.sky2); g.fillStyle = sky; g.fillRect(x, y, w, h);
    if (U.stars) { g.fillStyle = '#ffffff'; for (let i = 0; i < 26; i++) { const sx = x + ((i * 53) % w), sy = y + ((i * 97) % h); g.globalAlpha = 0.35 + (i % 3) * 0.2; g.fillRect(sx, sy, i % 4 ? 2 : 3, i % 4 ? 2 : 3); } g.globalAlpha = 1; }
    const cx = x + w / 2; let top = y + 30, bot = y + h - 60;
    if (t > 0.02 && t < 0.75) { const a = 1 - t / 0.75; g.fillStyle = `rgba(230,236,245,${0.45 * a})`; for (let i = 0; i < 6; i++) { const r = 8 + i * 3 + t * 30; g.beginPath(); g.arc(cx + (i - 2.5) * 14 * (1 + t), bot + 46 - (i % 2) * 6, r * 0.6, 0, 7); g.fill(); } }
    top -= up; bot -= up;
    const L = 52 * flame * (0.92 + 0.08 * Math.sin(t * 60)), fl = g.createLinearGradient(0, bot, 0, bot + L); fl.addColorStop(0, '#fff3c4'); fl.addColorStop(0.4, U.flame); fl.addColorStop(1, hexA(U.flame, 0)); g.fillStyle = fl;
    for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(cx + dx - 6 * Math.min(1.5, flame), bot + 4); g.lineTo(cx + dx, bot + L * (dx ? 0.85 : 1)); g.lineTo(cx + dx + 6 * Math.min(1.5, flame), bot + 4); g.fill(); }
    g.fillStyle = U.wing; g.strokeStyle = U.nose; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 10, top + 80); g.lineTo(cx - 50, bot - 6); g.lineTo(cx + 50, bot - 6); g.lineTo(cx + 10, top + 80); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = U.nose; g.beginPath(); g.moveTo(cx - 50, bot - 6); g.lineTo(cx - 42, bot - 18); g.lineTo(cx + 42, bot - 18); g.lineTo(cx + 50, bot - 6); g.closePath(); g.fill();
    g.fillStyle = U.body; g.beginPath(); g.moveTo(cx, top); g.bezierCurveTo(cx + 22, top + 18, cx + 20, top + 50, cx + 20, top + 70); g.lineTo(cx + 20, bot); g.lineTo(cx - 20, bot); g.lineTo(cx - 20, top + 70); g.bezierCurveTo(cx - 20, top + 50, cx - 22, top + 18, cx, top); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = U.nose; g.beginPath(); g.moveTo(cx, top); g.bezierCurveTo(cx + 13, top + 9, cx + 15, top + 18, cx + 16, top + 24); g.lineTo(cx - 16, top + 24); g.bezierCurveTo(cx - 15, top + 18, cx - 13, top + 9, cx, top); g.fill();
    g.fillStyle = U.window; g.fillRect(cx - 12, top + 30, 9, 7); g.fillRect(cx + 3, top + 30, 9, 7);
    g.fillStyle = U.stripe; g.fillRect(cx - 20, top + 62, 40, 10); g.fillStyle = U.body; g.fillRect(cx - 20, top + 72, 40, 3);
    g.fillStyle = U.wing; g.beginPath(); g.moveTo(cx - 5, bot - 40); g.lineTo(cx - 5, bot + 2); g.lineTo(cx + 5, bot + 2); g.lineTo(cx + 5, bot - 40); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = ink(s); suitPath(g, s, cx, top + 110, 26);
    g.restore(); if (U.label) { g.fillStyle = U.labelColor; g.font = `900 13px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(U.label, x + 6, y + h - 8); }
  }

  // ---------- face cards (portraits of the real fox-kit foxes) ----------
  let portraits = {};
  function drawFace(g, r, s, f = 0) {
    const F = S.faces, { x, y, w, h } = ART, k = RANK_CH(r), set = portraits[k + s], por = set && (set[f] || set[0]);
    g.fillStyle = isRed(s) ? F.redBg : F.blackBg; g.fillRect(x, y, w, h);
    if (por) g.drawImage(por, 0, 0, por.width, por.height, x, y, w, h - 30);
    g.fillStyle = F.bar; g.fillRect(x, y + h - 30, w, 30); g.fillStyle = F.barText; g.font = `900 15px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    const nm = (F.names && F.names[k]) || ''; let fs = 15; while (fs > 9 && g.measureText(nm).width > w - 12) { fs--; g.font = `900 ${fs}px ${FONT}`; } g.fillText(nm, x + 7, y + h - 14);
    g.strokeStyle = F.bar; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  }
  function paintCard(c, r, s, opt = {}) {
    const g = begin(c), col = ink(s), P = S.paper;
    const paper = g.createLinearGradient(0, 0, CWp, CHp); paper.addColorStop(0, P.top); paper.addColorStop(1, P.bottom); g.fillStyle = paper; g.fillRect(0, 0, CWp, CHp);
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; const rt = RANK_CH(r);
    g.save(); g.translate(36, 70); if (rt.length > 1) g.scale(0.72, 1); g.font = `900 66px ${FONT}`; g.fillText(rt, 0, 0); g.restore();
    suitPath(g, s, 36, 104, 46); g.fillStyle = col; g.fillRect(12, 136, 48, 4);
    if (r >= 11 && r <= 13) drawFace(g, r, s, opt.f || 0); else if (r === 14) drawShuttle(g, s, opt.t || 0);
    else { if (P.tint) { g.fillStyle = hexA(col, 0.06); g.fillRect(ART.x, ART.y, ART.w, ART.h); } const pts = PIPS[r], sz = r >= 9 ? 34 : 40; g.fillStyle = col; for (const [px, py] of pts) { const X = ART.x + 12 + px * (ART.w - 24), Y = ART.y + 18 + py * (ART.h - 36); if (py > 0.55) { g.save(); g.translate(X, Y); g.rotate(Math.PI); suitPath(g, s, 0, 0, sz); g.restore(); } else suitPath(g, s, X, Y, sz); } }
    cardEdge(g, P.edge);
  }

  // Portrait studio: its own small renderer + scene, so it works in the game, in the workshop and in the canvas.
  let studio = null;
  function makeStudio() {
    const PW = 236, PH = 444, canvas = document.createElement('canvas'); canvas.width = PW; canvas.height = PH;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(PW, PH, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(), grad = (() => { const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
    const mc = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!mc.has(k)) mc.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return mc.get(k); };
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide }), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
    function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return o; }
    function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
    const crestTex = (letter, ring, bg = '#070a13', fg = '#ffffff') => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = ring; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.fillStyle = fg; g.font = `900 70px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 64, 68); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), pick = a => a[Math.floor(Math.random() * a.length)];
    const kit = FK.foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
    scene.add(new THREE.HemisphereLight(0xffe9d2, 0x40202c, 1.05)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(2, 9, 4); scene.add(sun);
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(0.6, 3, 4); key.target.position.set(0, 1.6, 0); scene.add(key, key.target, new THREE.AmbientLight(0xffffff, 0.75));
    return { PW, PH, renderer, scene, kit, toon, grad, V3 };
  }
  function renderPortraits() {
    if (!studio) studio = makeStudio(); const { PW, PH, renderer, scene, kit, grad, V3 } = studio, F = S.faces;
    const pc = new THREE.PerspectiveCamera(29, PW / PH, 0.1, 20);
    const furLook = base => { const L = { ...base }; if (F.fur && F.fur.toLowerCase() !== '#f2741f') { L.fur = F.fur; L.paw = F.fur; L.tailMid = F.fur; L.furDark = shadeHex(F.fur, 0.75); L.tailBase = shadeHex(F.fur, 0.8); } return L; };
    const defs = { J: { base: FK.PLAYER_MALE, outfit: 'armor' }, Q: { base: FK.PLAYER_FEMALE, outfit: 'dress', crown: true }, K: { base: FK.KING_MIGHT, outfit: 'royal', crown: true } };
    const blank = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad }); let crest = null; const _w = V3(), _e = V3();
    const snap = () => { renderer.render(scene, pc); const c = document.createElement('canvas'); c.width = PW; c.height = PH; c.getContext('2d').drawImage(renderer.domElement, 0, 0);
      let at = null; if (crest) { crest.updateWorldMatrix(true, false); crest.getWorldPosition(_w); const ws = crest.getWorldScale(_e).x, rad = (crest.geometry.parameters.radiusTop || 0.1) * ws; const p0 = _w.clone().project(pc), p1 = _w.clone().add(V3(rad, 0, 0)).project(pc);
        at = { x: (p0.x * 0.5 + 0.5) * PW, y: (-p0.y * 0.5 + 0.5) * PH, r: Math.abs(p1.x - p0.x) * 0.5 * PW }; }
      return { c, at }; };
    const withSuit = (fr, s2) => { const c = document.createElement('canvas'); c.width = PW; c.height = PH; const g = c.getContext('2d'); g.drawImage(fr.c, 0, 0); const a = fr.at; if (!a || !F.crest) return c;
      const r = Math.max(a.r * 1.05, 13), col = ink(s2); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(a.x, a.y, r, 0, 7); g.fill(); g.strokeStyle = F.bar; g.lineWidth = Math.max(2, r * 0.14); g.stroke();
      g.strokeStyle = col; g.lineWidth = Math.max(1.2, r * 0.06); g.beginPath(); g.arc(a.x, a.y, r * 0.8, 0, 7); g.stroke(); g.fillStyle = col; suitPath(g, s2, a.x, a.y + r * 0.04, r * 1.05); return c; };
    const next = {};
    for (const [k, d] of Object.entries(defs)) for (const t of ['red', 'black']) {
      const v = F[k][t], look = { ...furLook(d.base), armorAccent: v.trim };
      const f = kit.makeFox({ torso: [v.top, v.main, v.trim], outfit: d.outfit, look, mood: 'happy', crown: !!d.crown }), u = f.userData; f.position.set(-0.1, 0, 0);
      crest = null; f.traverse(o => { if (!crest && o.isMesh && Array.isArray(o.material) && o.material.length === 3 && o.material[1] && o.material[1].map) { if (F.crest) o.material = [o.material[0], blank, o.material[2]]; crest = o; } });
      const settle = mood => { u.mood = mood; u.base = mood; u.blink = 99; u.blinkT = 0; u.lookT = 99; u.lookTo = 0; u.look = 0; kit.animFox(f, 0.3, 0); kit.animFox(f, 0.3, 0); u.blink = 99; u.blinkT = 0; kit.animFox(f, 0.0001, 0); };
      scene.background = new THREE.Color(t === 'red' ? F.redBg : F.blackBg);
      pc.position.set(0, 2.0, 4.7); pc.lookAt(0, 1.7, 0);
      settle('happy'); const smile = snap();
      u.blinkT = 0.0701; kit.animFox(f, 0.0001, 0); const shut = snap();
      const wink = { c: document.createElement('canvas'), at: smile.at }; wink.c.width = PW; wink.c.height = PH; const wg = wink.c.getContext('2d'); wg.drawImage(smile.c, 0, 0); wg.drawImage(shut.c, PW / 2, 0, PW / 2, PH, PW / 2, 0, PW / 2, PH);
      settle('excited'); const grin = snap();
      settle('happy'); const arm = u.P.arms[1], waves = []; for (const th of [2.55, 2.92]) { arm.rotation.set(0.45, 0, th); waves.push(snap()); }
      for (const s2 of (t === 'red' ? ['h', 'd'] : ['s', 'c'])) next[k + s2] = [smile, wink, grin, ...waves].map(fr => withSuit(fr, s2));
      scene.remove(f); f.traverse(o => { if (o.material && !Array.isArray(o.material) && o.material.map && o.material.map.isCanvasTexture && o.material !== blank) { /* face textures */ o.material.map.dispose(); } });
    }
    portraits = next;
  }
  if (wantPortraits) renderPortraits();

  return {
    CWp, CHp, RES, ART, rrect, suitPath, foxIcon, isRed, newCanvas, paintCard, paintBack,
    get style() { return S; },
    // change the style; re-shoot the fox portraits only when something they show changed
    setStyle(next) { const key = () => { const F = S.faces; return JSON.stringify([F.J, F.Q, F.K, F.fur, F.crest, F.redBg, F.blackBg, F.bar, S.paper.red, S.paper.black]); }, prev = key(); S = mergeStyle(DEFAULT_CARD_STYLE, next || {}); if (wantPortraits && key() !== prev) renderPortraits(); },
    renderPortraits,
    dispose() { if (studio) { studio.renderer.dispose(); try { studio.renderer.forceContextLoss(); } catch (e) {} studio = null; } },
  };
}
