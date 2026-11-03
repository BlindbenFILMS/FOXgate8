// MERU 2.0 — s98 CASTLE DELUXE PART A (Ben's answers s97): the keep's rooms [meruThroneroom] + [meruCastle] (built by meru2-castle.js, a closed set at L.CASTLE.IN).
// TWO keepers: STEWARD BARNABY (throne room + council room; treasury + courtyard in part B) and MADAM VELLUM, the librarian.
// A STAFF DOOR on the keep's east face (south of the great door) lets you in for work before the story opens the great door; the King's audience,
// castleDoorLines and grantGifts are untouched (the guard still decides the great door).
// Part A jobs: POLISH THE THRONE + CROWN · ROLL OUT THE RED CARPET · ANNOUNCE THE GUESTS · LIGHT THE CHANDELIERS · SET THE COUNCIL TABLE · THE WAR MAP (Steward)
//              SHELVE THE RETURNS · FIND THE LOST BOOKS (Librarian).
// Part C1 (s100): the 10 prizes = worlds/meru2-castle-prize.js (PZ): cape, knight outfit, titles, library card, royal chamber, gallery portrait, treasury share, royal horse, castle key, council seat.
// Frame: everything lives in G at (0, IY, 0): x / z are world, y is height above the keep floor.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { keeperPoser } from '../engine/keeper-poser.js?v=s645';   // s620c jointed keeper body language
import { castleJobsB, GAMES_B, RINGS_B, YRINGS_B } from './meru2-castle-jobs2.js';
import { casPrizes } from './meru2-castle-prize.js';
import { casLife } from './meru2-castle-life.js?v=s645';
const STEW = { name: 'Steward Barnaby', role: 'ROYAL STEWARD', color: '#1f2650',
  hello: ['Welcome to the King\u2019s house. A castle this size never stops needing hands. Ready?', 'Back at court? There is always polishing.', 'Throne, carpet, guests, candles, council. Pick your post.', 'The King notices good work. Eventually.'],
  open: ['Splendid. Fit for a king.', 'Very good. The court thanks you.', 'Tidy work. Again?', 'Excellent. I shall mention you.'],
  tips: ['Count to ten, then stop. Eleven coins make a crooked stack.', 'Thieves are quick. Watch the hands, not the faces.', 'Ease the portcullis down. A slam wakes the King.', 'Let go when the wind gusts. Flags are cheaper than rope.', 'Polish in small circles. Gold shows every fingerprint.', 'Keep the carpet between the gold lines. Crooked carpets start wars.', 'Learn the crests. Never guess a name at the door.', 'Lower the candles gently. A dropped chandelier is a very loud mistake.', 'Twelve seats at council. Plates in order, then goblets.', 'Move only the pin you are told. Generals sulk.'],
  about: [['I run the King\u2019s house: the hall, the council room, the treasury and the yard.'], ['If it shines, opens or gets served, it is my job. Now partly yours.']] };
const LIB = { name: 'Madam Vellum', role: 'ROYAL LIBRARIAN', color: '#3d2a52',
  hello: ['Shh. Welcome to the library. The returns are piling up. Will you help?', 'Back again? The books missed you.', 'Shelving or a lost book. Quietly, please.', 'Every book has a home. Help me find them.'],
  open: ['Lovely. Every book home.', 'Quiet and quick. Perfect.', 'The shelves thank you.', 'Well read, well done.'],
  tips: ['Match the colour first, then the number.', 'The bays are numbered along the top. Roll the ladder there first.', 'A spine sticking out is a book someone forgot.', 'Shelf one is the bottom shelf. Count up.'],
  about: [['Every story of Meru is on these shelves. The gates, the King, the lake.'], ['One day you may read them all. For now, shelve them.']] };
export function buildCastleJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, castle, L, wear, heal }) { const JW = jobWorker(THREE);
  const C = L && L.CASTLE; if (!C || !castle) return { prompt: () => null, talk: () => false, tick() {}, camFix() {}, quit() {}, busy: () => null, toast: () => '' };
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const IX = C.IN.x, IZ = C.IN.z, IY = C.IN.y, KX1 = C.keep[1], OY = C.y;
  const G = new THREE.Group(); G.name = 'castleJobs'; G.position.set(0, IY, 0); G.visible = false; scene.add(G);
  const GY = new THREE.Group(); GY.name = 'castleYardJobs'; GY.position.set(0, OY, 0); scene.add(GY);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), W = (lx, y, lz) => V(IX + lx, y, IZ + lz), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => v.clone().setY(v.y + IY);
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const colB = (a0, a1, c0, c1) => cols.push({ f: [IX + a0, IX + a1, IZ + c0, IZ + c1], y0: IY - 3, y1: IY + 15 }), colR = (x, z, r) => cols.push({ c: [IX + x, IZ + z, r], y0: IY - 3, y1: IY + 15 });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', GOLD = '#e6b45a', NAVY = '#1f2650', WOOD = '#6b4a32', DARK = '#3d2a1c', IRON = '#3d3b3a';
  const ROOMB = { hall: [-10, 10, -20, 20, 11], library: [-30, -10, -14, 2, 7], council: [10, 30, -14, 0, 7], treasury: [10, 22, 4, 16, 6] };
  // ================= the keepers =================
  const stew = kit.makeFox({ key: 'casSteward', torso: [NAVY, GOLD, '#111827'], crest: 'M', outfit: 'suit', gear: 'none', mood: 'warm' }); stew.position.copy(W(2.6, 0, 12.4)); stew.rotation.y = 0; G.add(stew); colR(2.6, 12.4, 0.45);
  const LPOSE = keeperPoser(THREE, ['k_arrange', 'think', 'k_clipboard']); const lib = kit.makeFox({ key: 'casLibrarian', joints: true, torso: ['#3d2a52', '#5e3a96', '#211a2b'], crest: 'M', outfit: 'robe', gear: 'none', mood: 'warm' }); lib.position.copy(W(-13.4, 0, -6)); lib.rotation.y = Math.PI / 2; G.add(lib); colR(-13.4, -6, 0.45);
  { const p = W(-13.4, 0, -7.4); box(G, 0.5, 1.1, 0.4, DARK, p.x, 0.55, p.z); const top = box(G, 0.62, 0.05, 0.5, '#4a3424', p.x, 1.14, p.z); top.rotation.x = -0.25; box(G, 0.42, 0.03, 0.3, '#f3efe2', p.x + 0.02, 1.18, p.z + 0.02).rotation.x = -0.25; colR(-13.4, -7.4, 0.4); }
  const kS = { key: 'casSteward', name: STEW.name, role: STEW.role, obj: stew, ry: 0, r: 6 }, kL = { key: 'casLibrarian', name: LIB.name, role: LIB.role, obj: lib, ry: Math.PI / 2, r: 6 };
  const lnS = text => ({ who: 'steward barnaby', role: STEW.role, text }), lnL = text => ({ who: 'madam vellum', role: LIB.role, text });
  // ================= the STAFF DOOR (outside, keep east face, south of the great door) =================
  const GO = new THREE.Group(); GO.name = 'castleStaffDoor'; scene.add(GO); const SDZ = -421, SD = V(KX1 + 1.3, OY, SDZ);
  { box(GO, 0.22, 2.7, 1.5, DARK, KX1 + 0.1, OY + 1.35, SDZ); for (const y of [0.6, 2.1]) box(GO, 0.24, 0.1, 1.5, IRON, KX1 + 0.12, OY + y, SDZ); box(GO, 0.4, 0.3, 1.9, '#9a9186', KX1 + 0.2, OY + 2.85, SDZ); cyl(GO, 0.05, 0.05, 0.12, GOLD, KX1 + 0.26, OY + 1.3, SDZ + 0.5, 8).rotation.z = Math.PI / 2;
    const t = CT(320, 128, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = GOLD; g.fillRect(0, 0, 14, h); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.font = '900 46px Archivo, sans-serif'; g.fillText('STAFF', 32, 44); g.fillStyle = YEL; g.font = '900 26px Archivo, sans-serif'; g.fillText('CASTLE JOBS \u00b7 KNOCK', 32, 96); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), new THREE.MeshBasicMaterial({ map: t, color: 0xe8e8e8 })); m.position.set(KX1 + 0.42, OY + 3.4, SDZ); m.rotation.y = Math.PI / 2; GO.add(m);
    const lt = cyl(GO, 0.12, 0.1, 0.3, IRON, KX1 + 0.45, OY + 2.5, SDZ + 1.05, 8); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); gl.position.set(lt.position.x, lt.position.y, lt.position.z); GO.add(gl); }
  const atStaff = P => Math.hypot(P.x - SD.x, P.z - SD.z) < 1.6 && Math.abs((P.y || 0) - OY) < 3;
  // ================= rings (local) =================
  const RINGS = { throne: [2.2, -11.8], carpet: [-2.2, -11.8], announce: [2.6, 15.6], chand: [0, 0.6], council: [22.5, -3.4], warmap: [27.8, -11.2], shelve: [-12.2, -0.6], lost: [-20.6, -11.9] }; Object.assign(RINGS, RINGS_B);
  for (const k in RINGS) { const p = W(RINGS[k][0], 0, RINGS[k][1]); const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, p.x, 0.07, p.z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, p.x, 0.072, p.z, 22); r1.renderOrder = r2.renderOrder = 1; }
  for (const k in YRINGS_B) { const [x, z] = YRINGS_B[k]; const r1 = cyl(GY, 0.5, 0.5, 0.012, YEL, x, 0.075, z, 22), r2 = cyl(GY, 0.42, 0.42, 0.014, INK, x, 0.077, z, 22); r1.renderOrder = r2.renderOrder = 1; }
  // ================= shop kit =================
  const GAMES = [{ k: 'throne', name: 'Polish the Throne', color: GOLD, by: 's', room: 'hall' }, { k: 'carpet', name: 'Roll Out the Carpet', color: '#a8323e', by: 's', room: 'hall' },
    { k: 'announce', name: 'Announce the Guests', color: NAVY, by: 's', room: 'hall' }, { k: 'chand', name: 'Light the Chandeliers', color: '#ff8a3a', by: 's', room: 'hall' },
    { k: 'council', name: 'Set the Council Table', color: WOOD, by: 's', room: 'council' }, { k: 'warmap', name: 'The War Map', color: '#2f7a4a', by: 's', room: 'council' },
    { k: 'shelve', name: 'Shelve the Returns', color: '#5e3a96', by: 'l', room: 'library' }, { k: 'lost', name: 'Find the Lost Books', color: '#3d2a52', by: 'l', room: 'library' }, ...GAMES_B];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'cas';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: STEW.color, boardTitle: 'Court roster', toWorld: toW, room: { X0: IX - 10, X1: IX + 10, Z0: IZ - 20, Z1: IZ + 20 }, door: [IX, IZ + 19], keeper: stew, keeperRy: 0, games: GAMES,
    board: { x: IX - 5.4, y: 4.2, z: IZ + 19.68, ry: Math.PI, w: 1.5 }, hiring: { x: IX - 3.4, y: 0, z: IZ + 17.2, ry: Math.PI / 2 }, hiringLine: 'WALK UP \u00b7 SERVE THE KING',
    sun: [{ x: IX - 7.4, z: IZ + 3, w: 3, d: 2.2 }, { x: IX + 7.4, z: IZ + 1.5, w: 3, d: 2.2 }, { x: IX - 7.4, z: IZ - 15, w: 3, d: 2.2 }, { x: IX + 7.4, z: IZ + 16, w: 3, d: 2.2 }],
    lamps: [[IX, 8, IZ - 6], [IX, 8, IZ + 6], [IX - 17.5, 5, IZ - 6.5], [IX + 20, 5, IZ - 7]], browse: [], clock: { x: IX + 5.4, y: 3.6, z: IZ + 19.7, ry: Math.PI } });
  // ================= state, sound, card UI =================
  let toastTxt = '', toastT = 0, talkS = 0, talkL = 0, busy = null, J = null, thanks = null, lastP = null, lastFox = null;
  const FYc = () => (J && J.fy != null ? J.fy : IY);
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), rub = () => noise(0.08, 0.02, 3000), thud = () => tone(110, 0.08, 0.18, 'sine');
  const trumpet = () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.035, i === 3 ? 0.7 : 0.18, 'sawtooth', i * 0.14)); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r, c) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + c + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const gauge = (v, lo, hi, needle) => '<div style="position:relative;height:20px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:' + (lo * 100).toFixed(1) + '%;width:' + ((hi - lo) * 100).toFixed(1) + '%;background:#9fd7a8"></div>' +
    (needle ? '<div style="position:absolute;top:-2px;bottom:-2px;left:calc(' + (v * 100).toFixed(1) + '% - 2px);width:4px;background:#201e1d"></div>' : '<div style="position:absolute;top:0;bottom:0;left:0;width:' + Math.min(100, v * 100).toFixed(1) + '%;background:' + (v > hi ? '#ec3013' : '#201e1d') + ';opacity:0.85"></div>') + '</div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null }; let keyS = 0;
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && !!J;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  addEventListener('keydown', e => { if (!jobOn() || (J.g !== 'carpet' && J.g !== 'portrait')) return; const k = (e.key || '').toLowerCase(); if (k === 'a' || k === 'arrowleft') keyS = -1; else if (k === 'd' || k === 'arrowright') keyS = 1; }, true);
  addEventListener('keyup', e => { const k = (e.key || '').toLowerCase(); if (k === 'a' || k === 'arrowleft' || k === 'd' || k === 'arrowright') keyS = 0; }, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v); tmp.y += FYc(); tmp.project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V();
  const hitPl = pl => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); return rc.ray.intersectPlane(pl, hitP) ? hitP.clone().setY(hitP.y - FYc()) : null; };
  const zPlane = lz => new THREE.Plane().setFromNormalAndCoplanarPoint(V(0, 0, 1), V(0, 0, IZ + lz));
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); (J.par || G).add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(128, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 ' + (txt.length > 2 ? 40 : 60) + 'px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.75, 1); sp.renderOrder = 6; return sp; };
  const nameTex = {}; const nameTag = (txt, bg, fg = '#ffffff', s = 0.95) => { const t = nameTex[txt + bg] || (nameTex[txt + bg] = CT(320, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; let fs = 44; g.font = '900 ' + fs + 'px Archivo, sans-serif'; while (g.measureText(txt).width > W2 - 36 && fs > 20) { fs -= 2; g.font = '900 ' + fs + 'px Archivo, sans-serif'; } g.fillText(txt, 18, H / 2 + 3); }));
    if (touch) s *= 1.2; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(s, s * 0.3, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const blotT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 3, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.6, 'rgba(255,255,255,0.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, rr = 23 + (i % 3) * 5; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } g.fill(); });
  const walkers = []; const walkTo = (f, to, sp, then) => { const d = f.position.distanceTo(to); f.rotation.y = Math.atan2(to.x - f.position.x, to.z - f.position.z); fly(f, to, Math.max(0.3, d / sp), 0, then); walkers.push(f); };
  const king = castle.king || null; let king0 = null;
  const moveKing = on => { if (!king) return; if (on) { if (!king0) king0 = { p: king.position.clone(), ry: king.rotation.y }; king.position.set(IX + 2.4, IY + 0.6, IZ - 17.2); king.rotation.y = -0.6; } else if (king0) { king.position.copy(king0.p); king.rotation.y = king0.ry; king0 = null; } };
  const CLOTH = new THREE.Group(); box(CLOTH, 0.16, 0.12, 0.03, '#efe6d2', 0, 0, 0); CLOTH.visible = false; G.add(CLOTH);
  // ================= JOB 1: POLISH THE THRONE + CROWN (drag) =================
  const THZ = -19.22, CRZ = -18.33;
  const CROWN = new THREE.Group(); CROWN.position.copy(W(0, 1.21, -18.55)); CROWN.visible = false; G.add(CROWN);
  { const gm = new THREE.MeshLambertMaterial({ color: GOLD }); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.14, 18, 1, true), gm); b.material.side = THREE.DoubleSide; b.position.y = 0.07; CROWN.add(b);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, s = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), gm); s.position.set(Math.sin(a) * 0.195, 0.2, Math.cos(a) * 0.195); CROWN.add(s); }
    cyl(CROWN, 0.17, 0.17, 0.1, '#7a1f2b', 0, 0.08, 0, 14); const j1 = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), LM('#d0283a')); j1.position.set(0, 0.07, 0.2); CROWN.add(j1);
    for (const s of [-1, 1]) { const j = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), LM('#2e6ad0')); j.position.set(s * 0.1, 0.07, 0.17); CROWN.add(j); } box(CROWN, 0.5, 0.06, 0.4, '#a8323e', 0, -0.03, 0); }
  const G1 = {
    begin() { J.ph = 0; moveKing(true); this.spots(); toast('THE KING STEPS ASIDE \u00b7 DRAG THE CLOTH OVER THE TARNISH', 2.8); },
    spots() { (J.sp || []).forEach(s => s.m.parent && s.m.parent.remove(s.m)); J.sp = []; const crown = J.ph === 1; CROWN.visible = crown; const n = crown ? 6 : 10, z = crown ? CRZ : THZ, sz = crown ? 0.07 : 0.24;
      for (let i = 0; i < n; i++) { let x, y, k = 0; do { x = IX + (crown ? rnd(-0.15, 0.15) : rnd(-0.72, 0.72)); y = crown ? rnd(1.24, 1.36) : rnd(1.4, 4.2); } while (J.sp.some(s => Math.hypot(s.p.x - x, s.p.y - y) < sz * 0.8) && ++k < 30);
        const m = own(new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), new THREE.MeshBasicMaterial({ map: blotT, color: '#3a3020', transparent: true, opacity: 0.85, depthWrite: false }))); m.position.set(x, y, IZ + z + 0.006); m.renderOrder = 3; J.sp.push({ p: m.position.clone(), m, d: 1 }); }
      J.pl = zPlane(z); J.lp = null; },
    press() { J.lp = null; },
    drag() { if (!ptr.down || J.pause > 0) return; const p = hitPl(J.pl); if (!p) return; const crown = J.ph === 1; p.x = clamp(p.x, IX - (crown ? 0.25 : 0.9), IX + (crown ? 0.25 : 0.9)); p.y = clamp(p.y, crown ? 1.18 : 1.2, crown ? 1.45 : 4.4);
      CLOTH.visible = true; CLOTH.scale.setScalar(crown ? 0.45 : 1); CLOTH.position.set(p.x, p.y, IZ + (crown ? CRZ : THZ) + 0.04); const mv = J.lp ? J.lp.distanceTo(p) : 0; J.lp = p; if (mv < 0.002) return; if ((J.sw = (J.sw || 0) + mv) > (crown ? 0.1 : 0.25)) { J.sw = 0; rub(); }
      const R = crown ? 0.05 : 0.17, k = crown ? 7 : 2.6; for (const s of J.sp) { if (s.d <= 0 || Math.hypot(s.p.x - p.x, s.p.y - p.y) > R) continue; s.d -= mv * k; s.m.material.opacity = Math.max(0, s.d) * 0.85; if (s.d <= 0) { s.m.visible = false; tone(2600, 0.03, 0.25, 'triangle'); addGold(1); } }
      if (J.sp.every(s => s.d <= 0)) { ding(); CLOTH.visible = false; if (J.ph === 0) { J.ph = 1; toast('GLEAMING \u00b7 NOW THE CROWN', 1.4); NEXT(() => { G1.spots(); snapK = false; }, 0.9); } else { toast('THE CROWN SHINES', 1.2); NEXT(finishGame, 1.0); } } },
    release() { J.lp = null; },
    card() { const n = J.sp.filter(s => s.d > 0).length; return ['DRAG THE CLOTH', lab(J.ph ? 'THE CROWN' : 'THE THRONE') + lst([['#3a3020', 'TARNISH', n + ' LEFT', !n], [GOLD, 'THRONE', J.ph ? '\u2713' : '', J.ph > 0]]), 't' + J.ph + '_' + n]; },
    hint() { const s = J.sp.find(q => q.d > 0); return s ? [s.p.clone(), 'RUB'] : null; },
    shot() { return J.ph ? [W(0, 1.3, -18.45), 0.8, 0.55, 0.32, 1.1, 0, 1.7] : [W(0, 2.8, -19.2), 2.2, 3.6, 0.12, 2.6, 0, 4.4]; },
    end() { CROWN.visible = false; CLOTH.visible = false; moveKing(false); } };
  // ================= JOB 2: ROLL OUT THE RED CARPET (hold left / right to steer) =================
  const carpT = CT(128, 32, (g, w, h) => { g.fillStyle = '#b0283a'; g.fillRect(0, 0, w, h); g.fillStyle = GOLD; g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, h - 3, w, 3); });
  const carpM = new THREE.MeshLambertMaterial({ map: carpT }), segG = new THREE.PlaneGeometry(3.0, 0.54).rotateX(-Math.PI / 2);
  const CZ0 = -12.9, CZ1 = 18.0, CLINE = 0.45;
  const visFox = (() => { let f = null; return () => f || (f = (() => { const q = kit.makeFox({ key: 'casDuchess', torso: ['#1f3a8a', GOLD, '#111827'], crest: 'M', outfit: 'dress', gear: 'none', mood: 'happy', crown: true }); q.visible = false; G.add(q); return q; })()); })();
  const G2 = {
    begin() { J.x = 0; J.z = CZ0; J.next = CZ0; J.off = false; J.ph = 'roll'; J.wind = 0; J.wt = 0; J.wT = rnd(-0.8, 0.8);
      const r = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 3.0, 16), carpM); c.rotation.z = Math.PI / 2; r.add(c); J.roll = own(r); J.rollC = c; r.position.copy(W(0, 0.34, CZ0)); toast('HOLD LEFT OR RIGHT TO STEER \u00b7 STAY IN THE GOLD LINES', 3); },
    tick(dt) { if (J.ph !== 'roll') { const f = visFox(); if (f.visible) kit.animFox(f, dt, J.flies.length ? 1.4 : 0, false); return; }
      const s = ptr.down ? (ptr.x < innerWidth / 2 ? -1 : 1) : keyS; J.wt -= dt; if (J.wt <= 0) { J.wt = rnd(1.2, 2.6); J.wT = rnd(-0.9, 0.9); } J.wind += (J.wT - J.wind) * Math.min(1, dt * 1.5);
      J.x = clamp(J.x + (J.wind * 0.6 - s * 1.3) * dt, -1.3, 1.3); J.z += 2.3 * dt;
      while (J.next <= Math.min(J.z, CZ1)) { const m = own(new THREE.Mesh(segG, carpM)); m.position.copy(W(J.x, 0.072, J.next)); m.renderOrder = 1; J.next += 0.5; }
      const k = 1 - (J.z - CZ0) / (CZ1 - CZ0); J.rollC.scale.set(0.35 + k * 0.65, 1, 0.35 + k * 0.65); J.roll.position.copy(W(J.x, 0.34 * (0.35 + k * 0.65), J.z + 0.25)); J.rollC.rotation.x = 0; J.roll.rotation.x -= dt * 7;
      if (Math.abs(J.x) > CLINE && !J.off) { J.off = true; miss('OFF THE LINE \u00b7 STEER BACK', 1.2); } else if (Math.abs(J.x) < CLINE * 0.6) J.off = false;
      if ((J.tk = (J.tk || 0) + dt) > 0.35) { J.tk = 0; tone(90 + Math.random() * 20, 0.03, 0.12); }
      if (J.z >= CZ1) { J.ph = 'visit'; J.roll.visible = false; addGold(6); thud(); trumpet(); toast('THE DUCHESS OF TIDE ARRIVES', 2); const f = visFox(); f.position.copy(W(0, 0, 19.3)); f.visible = true; f.rotation.y = Math.PI;
        walkTo(f, W(0, 0, 6), 1.7, () => { if (!J) return; f.rotation.y = Math.PI; ding(); NEXT(finishGame, 0.9); }); } },
    card() { if (J.ph !== 'roll') return ['A VISITOR\u2026', lab('THE DUCHESS WALKS YOUR CARPET'), 'v']; const v = (1.3 - J.x) / 2.6; return [touch ? 'HOLD LEFT / RIGHT SIDE' : 'HOLD LEFT / RIGHT \u00b7 A / D', lab('CARPET ' + Math.round((J.z - CZ0) / (CZ1 - CZ0) * 100) + ' %') + gauge(v, (1.3 - CLINE) / 2.6, (1.3 + CLINE) / 2.6, true), 'c' + Math.round(J.z * 2) + '_' + Math.round(J.x * 40)]; },
    hint() { if (J.ph !== 'roll' || Math.abs(J.x) < 0.25) return null; return [W(J.x - Math.sign(J.x) * 1.2, 0.4, J.z + 0.6), 'HOLD']; },
    shot() { if (J.ph !== 'roll') { const f = visFox(); return [V(f.position.x, 1.0, f.position.z), 3, 2.4, 0.2, 3.5, Math.PI, 5]; } return [W(J.x * 0.5, 0.3, J.z + 3.0), 3.6, 1.2, 0.42, 4.2, Math.PI, 5.2]; },
    end() { const f = visFox(); f.visible = false; keyS = 0; } };
  // ================= JOB 3: ANNOUNCE THE GUESTS (match the name to the crest) =================
  const HOUSES = [{ k: 'OAK', c: '#2f7a4a', s: 'leaf' }, { k: 'TIDE', c: '#1f3a8a', s: 'wave' }, { k: 'EMBER', c: '#c8321e', s: 'flame' }, { k: 'STONE', c: '#6b6560', s: 'tower' }, { k: 'MOON', c: '#5e3a96', s: 'moon' }, { k: 'GOLD', c: '#b8862a', s: 'star' }];
  const crestDraw = (g, h, W2, H) => { const sx = W2 / 128, sy = H / 150; g.save(); g.scale(sx, sy); g.beginPath(); g.moveTo(8, 8); g.lineTo(120, 8); g.lineTo(120, 70); g.quadraticCurveTo(120, 128, 64, 146); g.quadraticCurveTo(8, 128, 8, 70); g.closePath(); g.fillStyle = h.c; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#ffffff'; g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.lineCap = 'round'; const cx = 64, cy = 68;
    if (h.s === 'leaf') { g.beginPath(); g.ellipse(cx, cy, 18, 34, 0.5, 0, 7); g.fill(); g.strokeStyle = h.c; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 14, cy + 26); g.lineTo(cx + 14, cy - 26); g.stroke(); }
    if (h.s === 'wave') for (let r = 0; r < 3; r++) { g.beginPath(); for (let x = 28; x <= 100; x += 3) g.lineTo(x, cy - 22 + r * 20 + Math.sin(x / 8) * 6); g.stroke(); }
    if (h.s === 'flame') { g.beginPath(); g.moveTo(cx, cy - 40); g.quadraticCurveTo(cx + 34, cy, cx + 18, cy + 30); g.quadraticCurveTo(cx, cy + 40, cx - 18, cy + 30); g.quadraticCurveTo(cx - 34, cy, cx, cy - 40); g.fill(); }
    if (h.s === 'tower') { g.fillRect(cx - 18, cy - 20, 36, 52); for (let i = 0; i < 3; i++) g.fillRect(cx - 22 + i * 16, cy - 34, 12, 16); g.fillStyle = h.c; g.fillRect(cx - 6, cy + 12, 12, 20); }
    if (h.s === 'moon') { g.beginPath(); g.arc(cx, cy, 32, 0, 7); g.fill(); g.fillStyle = h.c; g.beginPath(); g.arc(cx + 14, cy - 8, 28, 0, 7); g.fill(); }
    if (h.s === 'star') { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 15 : 36; g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.closePath(); g.fill(); }
    g.restore(); };
  const crestT = HOUSES.map(h => CT(128, 150, (g, W2, H) => crestDraw(g, h, W2, H)));
  const crestURL = HOUSES.map((h, i) => crestT[i].userData.c.toDataURL());
  const legend = () => '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;margin-top:6px">' + HOUSES.map((h, i) => '<div style="display:flex;align-items:center;gap:6px;font-weight:900;font-size:12px"><img src="' + crestURL[i] + '" style="width:18px;height:21px;flex:none">' + h.k + '</div>').join('') + '</div>';
  const gFox = {}, guestFox = (hi, lady) => { const k = hi + (lady ? 'L' : 'M'); return gFox[k] || (gFox[k] = (() => { const h = HOUSES[hi], f = kit.makeFox({ key: 'casGuest' + k, torso: [h.c, GOLD, INK], crest: 'M', outfit: lady ? 'dress' : 'coat', gear: 'none', mood: 'happy' }); f.visible = false; G.add(f); return f; })()); };
  const HERALD = W(0, 0, 16.2);
  const G3 = {
    begin() { J.q = shuffle([0, 1, 2, 3, 4, 5]); J.i = 0; this.next(); toast('READ THE CREST \u00b7 TAP THE MATCHING NAME', 2.8); },
    title() { return J.i % 2 ? 'LADY' : 'LORD'; },
    next() { const hi = J.q[J.i], lady = J.i % 2 === 1, f = guestFox(hi, lady); f.position.copy(W(0, 0, 19.3)); f.visible = true; J.ph = 'walk'; J.f = f;
      walkTo(f, HERALD, 1.4, () => { if (!J) return; f.rotation.y = Math.PI / 2; J.ph = 'ask'; const sh = own(new THREE.Sprite(new THREE.SpriteMaterial({ map: crestT[hi], depthTest: false }))); const s = touch ? 0.62 : 0.52; sh.scale.set(s, s * 1.17, 1); sh.renderOrder = 6; sh.position.copy(W(0.15, 2.3, 16.2)); J.sh = sh;
        const opts = shuffle([hi, ...shuffle([0, 1, 2, 3, 4, 5].filter(q => q !== hi)).slice(0, 2)]); J.tags = opts.map((h, k) => { const t = own(nameTag(G3.title() + ' ' + HOUSES[h].k, INK)); t.position.copy(W(0.5, 0.62, 16.2 + (1 - k) * 1.0)); return { s: t, h }; }); tone(880, 0.04, 0.2); }); },
    press() { if (J.ph !== 'ask') return; let best = null, bd = TAPR() * 1.7; for (const t of J.tags) { if (!t.s.visible) continue; const d = dist(scrW(t.s.position)); if (d < bd) { bd = d; best = t; } } if (!best) return; const hi = J.q[J.i];
      if (best.h !== hi) { best.s.visible = false; miss('THAT IS NOT THEIR CREST', 1.4); return; } trumpet(); addGold(4); toast('PRESENTING THE ' + G3.title() + ' OF ' + HOUSES[hi].k, 1.8); J.tags.forEach(t => { t.s.visible = false; }); J.sh.visible = false; J.ph = 'walk';
      const f = J.f; walkTo(f, W(J.i % 2 ? 2.4 : -2.4, 0, 9), 1.6, () => G3.after(f)); },
    after(f) { if (!J) return; f.visible = false; J.i++; if (J.i >= J.q.length) { ding(); NEXT(finishGame, 0.6); } else NEXT(() => G3.next(), 0.3); },
    card() { return [J.ph === 'ask' ? 'TAP THE RIGHT NAME' : 'THE NEXT GUEST\u2026', lab('GUEST ' + Math.min(6, J.i + 1) + ' / 6 \u00b7 THE HOUSES') + legend(), 'g' + J.i + J.ph]; },
    hint() { if (J.ph !== 'ask') return null; const t = J.tags.find(q => q.h === J.q[J.i]); return t ? [t.s.position.clone(), 'TAP'] : null; },
    shot() { return [W(0, 1.25, 16.2), 3.4, 2.6, 0.14, 3.2, Math.PI / 2, 4.6]; },
    end() { Object.values(gFox).forEach(f => { f.visible = false; }); } };
  // ================= JOB 4: LIGHT THE CHANDELIERS (hold to lower, tap the candles, hold to raise) =================
  const YTOP = 7.6, BAND = [1.5, 2.3], YLOW = 1.0, flameM = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const CH = [[-3.4, 3], [3.4, 3], [-3.4, 9], [3.4, 9]].map(([x, z]) => { const g = new THREE.Group(); g.position.copy(W(x, YTOP, z)); G.add(g);
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.045, 6, 24), LM(IRON)); t.rotation.x = Math.PI / 2; g.add(t); cyl(g, 0.03, 0.03, 0.8, IRON, 0, 0.4, 0, 6); for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2, s = box(g, 0.8, 0.03, 0.03, IRON, Math.cos(a) * 0.4, 0.2, Math.sin(a) * 0.4); s.rotation.y = -a; s.rotation.z = 0.45 * (i % 2 ? 1 : 1); }
    const cand = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, cx = Math.cos(a) * 0.8, cz = Math.sin(a) * 0.8; cyl(g, 0.035, 0.035, 0.2, '#f3efe2', cx, 0.12, cz, 6); const f = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), flameM); f.position.set(cx, 0.29, cz); f.visible = false; g.add(f); cand.push(f); }
    const rope = box(G, 0.025, 1, 0.025, '#8a6a42', IX + x, 9, IZ + z); const sx = Math.sign(x), wx = sx * 5.38;
    const winch = new THREE.Group(); winch.position.copy(W(wx, 1.2, z)); G.add(winch); const drum = cyl(winch, 0.12, 0.12, 0.3, WOOD, 0, 0, 0, 10); drum.rotation.x = Math.PI / 2; box(winch, 0.08, 0.5, 0.42, IRON, sx * 0.08, 0, 0); const crank = box(winch, 0.03, 0.26, 0.03, IRON, -sx * 0.06, 0.12, 0.2); crank.userData.base = 0;
    box(G, 0.025, 9.6, 0.025, '#8a6a42', IX + wx - sx * 0.02, 6.0, IZ + z + 0.1); box(G, Math.abs(wx - x), 0.025, 0.025, '#8a6a42', IX + (wx + x) / 2, 10.8, IZ + z + 0.1); cyl(G, 0.09, 0.09, 0.06, IRON, IX + x, 10.8, IZ + z, 8).rotation.x = Math.PI / 2;
    return { g, cand, rope, winch, crank, x, z, y: YTOP, lit: false }; });
  const placeCh = c => { c.g.position.y = c.y; const top = 10.8, len = top - (c.y + 0.8); c.rope.scale.y = Math.max(0.05, len); c.rope.position.y = c.y + 0.8 + len / 2; };
  const setLitCh = (c, on) => { c.lit = on; c.cand.forEach(f => { f.visible = on; }); };
  const G4 = {
    begin() { J.c = 0; J.ph = 'lower'; CH.forEach(c => { c.y = YTOP; placeCh(c); setLitCh(c, false); }); toast('HOLD TO LOWER THE CHANDELIER \u00b7 LET GO ON THE GREEN', 3); },
    cur() { return CH[J.c]; },
    press() { const c = this.cur(); if (!c) return; if (J.ph === 'lower' || J.ph === 'raise') { J.hold = true; return; }
      if (J.ph === 'light') { let best = null, bd = TAPR() * 1.15; for (const f of c.cand) { if (f.visible) continue; const p = f.getWorldPosition(V()).setY(f.getWorldPosition(V()).y - IY); const d = dist(scrW(p)); if (d < bd) { bd = d; best = f; } }
        if (!best) return; best.visible = true; tone(700 + c.cand.filter(f => f.visible).length * 60, 0.04, 0.2, 'triangle'); noise(0.12, 0.02, 2500); addGold(1);
        if (c.cand.every(f => f.visible)) { c.lit = true; pop(); J.ph = 'raise'; toast('ALL LIT \u00b7 HOLD TO RAISE IT', 1.6); } } },
    release() { const wasHold = J.hold; J.hold = false; if (!wasHold) return; const c = this.cur(); if (J.ph === 'lower') { if (c.y <= BAND[1] && c.y >= BAND[0]) { J.ph = 'light'; pop(); toast('TAP EVERY CANDLE', 1.4); snapK = false; } else if (c.y > BAND[1]) toast('LOWER STILL \u00b7 HOLD AGAIN', 1.1); } },
    tick(dt) { const c = this.cur(); if (!c) return; if (J.hold && (J.ph === 'lower' || J.ph === 'raise')) { c.y += (J.ph === 'lower' ? -2.4 : 2.0) * dt; c.crank.rotation.x += dt * (J.ph === 'lower' ? -8 : 8); if ((J.cr = (J.cr || 0) + dt) > 0.12) { J.cr = 0; tone(240 + Math.random() * 40, 0.025, 0.06, 'square'); }
        if (J.ph === 'lower' && c.y < YLOW) { c.y = 1.9; J.hold = false; J.ph = 'light'; thud(); noise(0.3, 0.06, 800); miss('CLUNK \u00b7 TOO LOW \u00b7 LIGHT IT ANYWAY', 1.8); }
        if (J.ph === 'raise' && c.y >= YTOP) { c.y = YTOP; J.hold = false; tone(1200, 0.05, 0.3, 'triangle'); addGold(2); J.c++; if (J.c >= CH.length) { ding(); toast('THE HALL GLOWS', 1.4); NEXT(finishGame, 1.0); } else { J.ph = 'lower'; toast('LOCKED \u00b7 NEXT CHANDELIER', 1.2); } } }
      placeCh(c); },
    card() { const c = this.cur() || CH[CH.length - 1], hgt = (c.y - YLOW + 0.1) / (YTOP - YLOW + 0.1), n = c.cand.filter(f => f.visible).length;
      const body = J.ph === 'light' ? lst([['#ffb347', 'CANDLES', n + ' / 8', n >= 8]]) : J.ph === 'lower' ? gauge(1 - hgt, 1 - (BAND[1] - YLOW + 0.1) / (YTOP - YLOW + 0.1), 1 - (BAND[0] - YLOW + 0.1) / (YTOP - YLOW + 0.1)) : gauge(hgt, 0.97, 1);
      return [J.ph === 'light' ? 'TAP THE CANDLES' : J.ph === 'lower' ? 'HOLD \u00b7 LET GO ON GREEN' : 'HOLD TO RAISE', lab('CHANDELIER ' + Math.min(4, J.c + 1) + ' / 4') + body, 'h' + J.c + J.ph + Math.round(c.y * 8) + '_' + n]; },
    hint() { const c = this.cur(); if (!c || J.hold) return null; if (J.ph === 'light') { const f = c.cand.find(q => !q.visible); if (!f) return null; const p = f.getWorldPosition(V()); p.y -= IY; return [p, 'TAP']; } return [c.winch.position.clone(), 'HOLD']; },
    shot() { const c = this.cur() || CH[CH.length - 1], yaw = c.x > 0 ? -0.5 : 0.5; return J.ph === 'light' ? [V(IX + c.x, c.y + 0.1, IZ + c.z), 2.0, 1.2, 0.75, 1.6, yaw, 3.0] : [V(IX + c.x + Math.sign(c.x) * 0.9, 4.2, IZ + c.z), 4.2, 7.8, 0.08, 4, yaw, 9]; },
    end() { CH.forEach(c => { if (c.y !== YTOP) { c.y = YTOP; placeCh(c); } if (!c.cand.every(f => f.visible)) setLitCh(c, false); }); } };
  CH.forEach(placeCh);
  let lastH = null;
  // ================= JOB 5: SET THE COUNCIL TABLE (12 places: plates in order, then goblets) =================
  const TOPY = 0.875, PL = [...[16, 18, 20, 22, 24].map(x => [x, -8.12, 1]), ...[16, 18, 20, 22, 24].map(x => [x, -5.88, -1]), [14.9, -7, 0], [25.1, -7, 0]];
  const STACK = W(12.4, 0, -12.6); { box(G, 1.0, 0.06, 0.7, WOOD, STACK.x, 0.8, STACK.z); for (const a of [-0.42, 0.42]) for (const b of [-0.28, 0.28]) box(G, 0.06, 0.78, 0.06, DARK, STACK.x + a, 0.39, STACK.z + b); for (let i = 0; i < 5; i++) cyl(G, 0.17, 0.15, 0.02, '#f3efe2', STACK.x - 0.2, 0.84 + i * 0.022, STACK.z, 14);
    for (let i = 0; i < 3; i++) cyl(G, 0.05, 0.04, 0.12, GOLD, STACK.x + 0.25 + (i % 2) * 0.1, 0.9, STACK.z - 0.1 + i * 0.1, 8); colB(11.8, 13.0, -13.0, -12.2); }
  const plate = () => { const g = new THREE.Group(); cyl(g, 0.17, 0.15, 0.02, '#f3efe2', 0, 0.01, 0, 16); const r = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 4, 18), LM(GOLD)); r.rotation.x = Math.PI / 2; r.position.y = 0.022; g.add(r); return g; };
  const goblet = () => { const g = new THREE.Group(); cyl(g, 0.045, 0.045, 0.01, GOLD, 0, 0.005, 0, 8); cyl(g, 0.012, 0.012, 0.09, GOLD, 0, 0.05, 0, 6); cyl(g, 0.045, 0.025, 0.07, GOLD, 0, 0.13, 0, 10); return g; };
  const gobAt = i => { const [x, z, s] = PL[i]; return s ? W(x + s * 0.24, TOPY, z + s * 0.1) : W(x, TOPY, z + (x < 20 ? 0.26 : -0.26)); };
  const G5 = {
    begin() { J.order = shuffle([...Array(12).keys()]); J.k = 0; J.ph = 'plates'; J.has = PL.map(() => 0); J.tags = PL.map((p, i) => { const s = own(tagSprite(String(J.order.indexOf(i) + 1), '#d6d2cb', INK, 0.22)); s.position.copy(W(p[0], TOPY + 0.2, p[1])); return s; }); this.mark(); toast('PLATES IN NUMBER ORDER \u00b7 THEN A GOBLET AT EVERY PLACE', 3); },
    mark() { J.tags.forEach((s, i) => { const n = J.order.indexOf(i); s.visible = J.ph === 'plates' && n >= J.k; s.material.map = tagFor(String(n + 1), n === J.k ? YEL : '#d6d2cb', INK); }); },
    near(f) { let best = -1, bd = TAPR() * 1.2; PL.forEach((p, i) => { if (!f(i)) return; const d = dist(scrW(W(p[0], TOPY, p[1]))); if (d < bd) { bd = d; best = i; } }); return best; },
    press() { if (J.flies.length) return;
      if (J.ph === 'plates') { const i = this.near(q => !J.has[q]); if (i < 0) return; if (i !== J.order[J.k]) { miss('NOT THAT SEAT \u00b7 FOLLOW THE NUMBERS', 1.4); return; } J.has[i] = 1; J.k++; this.mark(); const p = own(plate()); p.position.copy(STACK).setY(0.95);
        fly(p, W(PL[i][0], TOPY, PL[i][1]), 0.42, 0.5, () => { tone(1800, 0.03, 0.15, 'triangle'); addGold(1); if (J && J.k >= 12) { J.ph = 'goblets'; pop(); toast('NOW A GOBLET BY EVERY PLATE', 1.6); } }); return; }
      if (J.ph === 'goblets') { const i = this.near(q => J.has[q] > 0); if (i < 0) return; if (J.has[i] === 2) { miss('THAT PLACE HAS A GOBLET', 1.2); return; } J.has[i] = 2; const g = own(goblet()); g.position.copy(STACK).setY(0.95);
        fly(g, gobAt(i), 0.4, 0.45, () => { tone(2400, 0.03, 0.3, 'triangle'); addGold(1); if (J && J.has.every(q => q === 2)) { ding(); toast('THE COUNCIL MAY SIT', 1.4); NEXT(finishGame, 0.9); } }); } },
    card() { const g = J.has.filter(q => q === 2).length; return [J.ph === 'plates' ? 'TAP PLACE ' + Math.min(12, J.k + 1) : 'TAP A PLATE', lst([['#f3efe2', 'PLATES', J.k + ' / 12', J.k >= 12], [GOLD, 'GOBLETS', g + ' / 12', g >= 12]]), 'p' + J.k + '_' + g]; },
    hint() { if (J.ph === 'plates') { const i = J.order[J.k]; return i != null ? [W(PL[i][0], TOPY, PL[i][1]), 'TAP'] : null; } const i = J.has.findIndex(q => q === 1); return i >= 0 ? [W(PL[i][0], TOPY, PL[i][1]), 'TAP'] : null; },
    shot() { return [W(20, 0.9, -7), 12.4, 3.6, 0.95, 5, 0, 8.5]; },
    end() {} };
  // ================= JOB 6: THE WAR MAP (move the pins to the ordered gates on the wall map) =================
  const WMX = 29.62, gateAt = i => { const a = i / 8 * Math.PI * 2 - Math.PI / 2, gx = 256 + Math.cos(a) * 96, gy = 128 + Math.sin(a) * 96 * 0.9; return W(WMX, 3.6 + (0.5 - gy / 256) * 3, -7 + (gx / 512 - 0.5) * 6); };
  const tagOut = i => { const a = i / 8 * Math.PI * 2 - Math.PI / 2; return gateAt(i).add(V(-0.04, -Math.sin(a) * 0.32, Math.cos(a) * 0.32)); };
  const PINS = [['RED', '#d0283a'], ['BLUE', '#3a6ae0'], ['GREEN', '#2f9a4a'], ['GOLD', '#e6b45a']];
  const pinG = c => { const g = new THREE.Group(); const r = cyl(g, 0.012, 0.012, 0.16, '#c0c4cc', 0, 0, 0, 6); r.rotation.z = Math.PI / 2; r.position.x = 0.08; const h = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), LM(c)); g.add(h); return g; };
  const G6 = {
    begin() { J.at = shuffle([...Array(8).keys()]).slice(0, 4); J.pins = PINS.map((p, i) => { const g = own(pinG(p[1])); g.position.copy(gateAt(J.at[i])).add(V(-0.1, 0, 0)); return g; }); J.gt = [...Array(8).keys()].map(i => { const s = own(tagSprite(String(i + 1), '#ffffff', INK, 0.22)); s.position.copy(tagOut(i)); return s; });
      J.o = 0; J.sel = -1; this.order(); toast('TAP THE PIN \u00b7 THEN ITS NEW GATE', 2.6); },
    order() { const free = [...Array(8).keys()].filter(g => !J.at.includes(g)), p = Math.random() * 4 | 0; J.cur = { p, g: free[Math.random() * free.length | 0] }; tone(523, 0.04, 0.2); },
    pick(i) { if (J.sel >= 0) J.pins[J.sel].position.x = IX + WMX - 0.1; J.sel = i; J.pins[i].position.x = IX + WMX - 0.24; pop(); },
    press() { if (J.flies.length) return; let bp = -1, pd = TAPR() * 1.2; J.pins.forEach((g, i) => { const d = dist(scrW(g.position)); if (d < pd) { pd = d; bp = i; } });
      let bg = -1, gd = TAPR() * 1.3; for (let i = 0; i < 8; i++) { if (J.at.includes(i)) continue; const d = Math.min(dist(scrW(gateAt(i))), dist(scrW(J.gt[i].position))); if (d < gd) { gd = d; bg = i; } }
      if (bp >= 0 && (bg < 0 || pd <= gd || J.sel < 0)) { this.pick(bp); return; } if (bg < 0) return; if (J.sel < 0) { toast('TAP A PIN FIRST', 1.0); return; }
      const c = J.cur; if (J.sel !== c.p) { miss('WRONG PIN \u00b7 MOVE THE ' + PINS[c.p][0] + ' PIN', 1.5); return; } if (bg !== c.g) { miss('WRONG GATE \u00b7 GATE ' + (c.g + 1), 1.4); return; }
      const p = J.sel; J.sel = -1; J.at[p] = bg; fly(J.pins[p], gateAt(bg).add(V(-0.1, 0, 0)), 0.45, 0, () => { if (!J) return; thud(); tone(1500, 0.03, 0.2, 'triangle'); addGold(3); J.o++; if (J.o >= 6) { ding(); toast('THE GENERALS ARE PLEASED', 1.4); NEXT(finishGame, 0.9); } else { toast('ORDER DONE', 0.8); G6.order(); } }); },
    card() { const c = J.cur; return ['MOVE ' + PINS[c.p][0] + ' TO GATE ' + (c.g + 1), lab('ORDER ' + Math.min(6, J.o + 1) + ' / 6') + lst(PINS.map((p, i) => [p[1], p[0], 'GATE ' + (J.at[i] + 1), i === c.p])), 'w' + J.o + '_' + J.sel + '_' + J.at.join('')]; },
    hint() { const c = J.cur; if (J.sel !== c.p) return [J.pins[c.p].position.clone(), 'TAP']; return [gateAt(c.g), 'TAP']; },
    shot() { return [W(WMX, 3.6, -7), 6.2, 3.2, -0.04, 3, -Math.PI / 2, 6.5]; },
    end() {} };
  // ================= JOB 7: SHELVE THE RETURNS (Librarian; tap a book, tap the slot with its colour + number) =================
  const BCZ = 1.5, BAYS = [-13.2, -12.4, -11.6, -10.8], ROWS = [0.12, 1.0];
  const LABS = [['RED', '#a8323e', 1], ['RED', '#a8323e', 2], ['BLUE', '#1f3a8a', 3], ['BLUE', '#1f3a8a', 4], ['GREEN', '#2e6a3a', 5], ['GREEN', '#2e6a3a', 6], ['GOLD', '#b8862a', 7], ['GOLD', '#b8862a', 8]];
  { const x = -12, wd = 3.3; box(G, wd, 2.0, 0.06, DARK, IX + x, 1.0, IZ + BCZ + 0.22); for (const s of [-1, 1]) box(G, 0.06, 2.0, 0.5, DARK, IX + x + s * wd / 2, 1.0, IZ + BCZ); for (let i = 1; i < 4; i++) box(G, 0.04, 1.86, 0.46, '#4a3424', IX + x - wd / 2 + i * 0.8 + 0.05, 1.0, IZ + BCZ);
    for (const y of [0.06, 0.94, 1.86]) box(G, wd, 0.06, 0.5, '#4a3424', IX + x, y + 0.03, IZ + BCZ); box(G, wd + 0.1, 0.1, 0.56, '#4a3424', IX + x, 2.05, IZ + BCZ);
    const t = CT(256, 64, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('RETURNS', 14, h / 2 + 2); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: t })); m.position.copy(W(x - 1.0, 2.28, BCZ + 0.05)); m.rotation.y = Math.PI; G.add(m);
    colB(x - wd / 2 - 0.05, x + wd / 2 + 0.05, BCZ - 0.28, BCZ + 0.3); }
  const CART = W(-14.9, 0, -0.5); { box(G, 0.6, 0.05, 1.6, WOOD, CART.x, 0.72, CART.z); box(G, 0.6, 0.05, 1.6, WOOD, CART.x, 0.3, CART.z); for (const a of [-0.26, 0.26]) for (const b of [-0.76, 0.76]) { box(G, 0.04, 0.72, 0.04, DARK, CART.x + a, 0.38, CART.z + b); cyl(G, 0.05, 0.05, 0.04, INK, CART.x + a, 0.05, CART.z + b, 8).rotation.x = Math.PI / 2; } colB(-15.25, -14.55, -1.35, 0.35); }
  const slotP = s => W(BAYS[s % 4], ROWS[s / 4 | 0] + 0.3, BCZ - 0.06);
  const G7 = {
    begin() { J.sl = shuffle([...Array(8).keys()]); J.fill = J.sl.map(() => false); J.lt = J.sl.map((l, s) => { const sp = own(tagSprite(String(LABS[l][2]), LABS[l][1], '#ffffff', 0.17)); sp.position.copy(W(BAYS[s % 4], ROWS[s / 4 | 0] + 0.08, BCZ - 0.3)); return sp; });
      J.bk = shuffle([...Array(8).keys()]).map((l, i) => { const g = new THREE.Group(); box(g, 0.3, 0.44, 0.1, LABS[l][1], 0, 0.22, 0); box(g, 0.3, 0.04, 0.104, GOLD, 0, 0.36, 0); const n = tagSprite(String(LABS[l][2]), '#ffffff', INK, 0.15); n.position.set(0, 0.6, 0); g.add(n); own(g); g.position.copy(CART).setY(0.745).add(V(0, 0, -0.66 + i * 0.19)); g.userData.home = g.position.clone(); return { g, l, on: false, n }; });
      J.sel = null; toast('TAP A BOOK \u00b7 THEN THE SLOT WITH ITS COLOUR + NUMBER', 3); },
    press() { if (J.flies.length) return; let bb = null, bd = TAPR() * 1.2; for (const b of J.bk) { if (b.on) continue; const d = dist(scrW(b.g.position.clone().add(V(0, 0.25, 0)))); if (d < bd) { bd = d; bb = b; } }
      let bs = -1, sd = TAPR() * 1.4; for (let s = 0; s < 8; s++) { if (J.fill[s]) continue; const d = Math.min(dist(scrW(slotP(s))), dist(scrW(J.lt[s].position))); if (d < sd) { sd = d; bs = s; } }
      if (bb && (!J.sel || bd < sd || bs < 0)) { if (J.sel) J.sel.g.position.copy(J.sel.g.userData.home); J.sel = bb; bb.g.position.y = bb.g.userData.home.y + 0.14; pop(); return; }
      if (bs < 0) return; if (!J.sel) { toast('PICK A BOOK FIRST', 1.0); return; } const b = J.sel, L2 = LABS[J.sl[bs]], B2 = LABS[b.l];
      if (L2[0] !== B2[0]) { miss('WRONG COLOUR \u00b7 THAT SLOT IS ' + L2[0], 1.4); return; } if (L2[2] !== B2[2]) { miss('RIGHT COLOUR \u00b7 WRONG NUMBER', 1.4); return; }
      J.sel = null; J.fill[bs] = true; b.on = true; b.n.visible = false; J.lt[bs].visible = false; b.g.rotation.y = Math.PI / 2; fly(b.g, W(BAYS[bs % 4], ROWS[bs / 4 | 0] + 0.06, BCZ - 0.02), 0.45, 0.25, () => { thud(); addGold(2); if (J && J.fill.every(Boolean)) { ding(); toast('EVERY BOOK HOME', 1.3); NEXT(finishGame, 0.9); } }); },
    card() { const n = J.fill.filter(Boolean).length; return [J.sel ? 'TAP SLOT ' + LABS[J.sel.l][0] + ' ' + LABS[J.sel.l][2] : 'TAP A BOOK', lab('SHELVED ' + n + ' / 8') + lst(['RED', 'BLUE', 'GREEN', 'GOLD'].map(c => { const ids = J.sl.map((l, s) => [l, s]).filter(([l]) => LABS[l][0] === c), k = ids.filter(([, s]) => J.fill[s]).length; return [LABS[ids[0][0]][1], c, k + ' / 2', k === 2]; })), 'b' + n + '_' + (J.sel ? J.sel.l : '')]; },
    hint() { if (!J.sel) { const b = J.bk.find(q => !q.on); return b ? [b.g.position.clone().add(V(0, 0.25, 0)), 'TAP'] : null; } const s = J.sl.findIndex((l, i) => l === J.sel.l && !J.fill[i]); return s >= 0 ? [slotP(s), 'TAP'] : null; },
    shot() { return [W(-12.9, 1.0, 0.4), 4.8, 2.4, 0.3, 3, Math.PI, 5.5]; },
    end() {} };
  // ================= JOB 8: FIND THE LOST BOOKS (Librarian; roll the ladder to the bay, tap the book on the right shelf) =================
  const NZ = -13.25, BAYX = [...Array(8).keys()].map(i => -27.9 + i * 2.2), SHY = [0.3, 1.05, 1.8, 2.55];
  const BCOL = { RED: '#a8323e', BLUE: '#2a4a9a', GREEN: '#2e7a4a', GOLD: '#d8a23a', PURPLE: '#6a3aa6' }, BC = Object.keys(BCOL);
  const TITLES = [['THE EIGHT GATES', 'RED'], ['FOXES OF MERU', 'BLUE'], ['THE ARENA YEARS', 'GREEN'], ['KING MIGHT\u2019S MARCH', 'GOLD'], ['STARS OVER THE RIDGE', 'PURPLE'], ['PEARLS OF THE LAKE', 'BLUE'], ['THE IRON WARDEN', 'RED'], ['A GUIDE TO CASTLE RIDGE', 'GREEN']];
  box(G, 17.6, 0.04, 0.04, IRON, IX - 20.2, 3.25, IZ + NZ + 0.22);
  const LAD = new THREE.Group(); LAD.position.copy(W(BAYX[3], 0, NZ + 0.62)); LAD.rotation.x = -0.16; G.add(LAD);
  { for (const s of [-1, 1]) box(LAD, 0.06, 3.5, 0.06, '#8a6440', s * 0.28, 1.75, 0); for (let i = 0; i < 10; i++) box(LAD, 0.56, 0.04, 0.05, '#8a6440', 0, 0.3 + i * 0.33, 0); for (const s of [-1, 1]) cyl(LAD, 0.045, 0.045, 0.03, INK, s * 0.28, 0.04, 0.02, 8).rotation.z = Math.PI / 2; }
  const G8 = {
    begin() { const bays = shuffle([...Array(8).keys()]).slice(0, 3); J.req = shuffle(TITLES.slice()).slice(0, 3).map(([t, col], i) => ({ t, col, bay: bays[i], row: Math.random() * 4 | 0 })); J.r = 0; J.bay = 3; LAD.position.x = IX + BAYX[3];
      J.bt = BAYX.map((x, i) => { const s = own(tagSprite(String(i + 1), '#ffffff', INK, 0.3)); s.position.copy(W(x, 3.72, NZ)); return s; }); J.cd = []; this.cands(); this.markBay(); toast('ROLL THE LADDER TO THE BAY \u00b7 TAP THE BOOK', 3); },
    markBay() { const q = J.req[J.r]; J.bt.forEach((s, i) => { s.material.map = tagFor(String(i + 1), i === J.bay ? YEL : '#ffffff', INK); }); },
    cands() { J.cd.forEach(c => c.m.parent && c.m.parent.remove(c.m)); J.cd = []; const q = J.req[J.r]; if (!q) return;
      for (let r = 0; r < 4; r++) { const ok = J.bay === q.bay && r === q.row; let col = ok ? q.col : BC[Math.random() * BC.length | 0]; if (!ok && r === q.row) while (col === q.col) col = BC[Math.random() * BC.length | 0];
        const g = new THREE.Group(); box(g, 0.14, 0.52, 0.36, BCOL[col], 0, 0.26, 0); box(g, 0.145, 0.05, 0.365, GOLD, 0, 0.42, 0); box(g, 0.145, 0.05, 0.365, GOLD, 0, 0.1, 0); own(g); g.position.copy(W(BAYX[J.bay] + rnd(-0.55, 0.55), SHY[r] + 0.02, NZ + 0.02)); J.cd.push({ m: g, ok, r }); } },
    press() { if (J.flies.length) return; let bb = -1, bd = TAPR() * 1.3; J.bt.forEach((s, i) => { const d = dist(scrW(s.position)); if (d < bd) { bd = d; bb = i; } });
      let bc = null, cd = TAPR() * 1.2; for (const c of J.cd) { if (!c.m.visible) continue; const d = dist(scrW(c.m.position.clone().add(V(0, 0.26, 0)))); if (d < cd) { cd = d; bc = c; } }
      if (bb >= 0 && (!bc || bd < cd)) { if (bb === J.bay) return; const di = Math.abs(bb - J.bay); J.bay = bb; this.markBay(); J.cd.forEach(c => { c.m.visible = false; }); J.rolling = true; tone(300, 0.03, 0.4, 'triangle');
        fly(LAD, V(IX + BAYX[bb], 0, LAD.position.z), Math.min(1.4, 0.35 + di * 0.16), 0, () => { if (!J) return; J.rolling = false; thud(); G8.cands(); }); return; }
      if (!bc) return; if (!bc.ok) { miss('NOT THAT ONE \u00b7 CHECK THE CLUE', 1.4); bc.m.visible = false; return; }
      ding(); addGold(5); const q = J.req[J.r]; toast('FOUND \u00b7 ' + q.t, 1.6); bc.m.visible = false; J.r++; if (J.r >= J.req.length) NEXT(finishGame, 1.0); else NEXT(() => { G8.cands(); G8.markBay(); }, 0.8); },
    card() { const q = J.req[Math.min(J.r, J.req.length - 1)]; return ['FIND THE BOOK', lab('BOOK ' + Math.min(3, J.r + 1) + ' / 3') + '<div style="margin-top:6px;border:2px solid #201e1d;padding:6px 8px;background:#ffffff"><div style="font-weight:900;font-size:14px">' + q.t + '</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-weight:900;font-size:12px"><span style="width:12px;height:12px;background:' + BCOL[q.col] + ';border:2px solid #201e1d"></span>' + q.col + ' \u00b7 BAY ' + (q.bay + 1) + ' \u00b7 SHELF ' + (q.row + 1) + '</div></div>' + lab('SHELF 1 = THE BOTTOM'), 'l' + J.r + '_' + J.bay]; },
    hint() { const q = J.req[J.r]; if (!q || J.rolling) return null; if (J.bay !== q.bay) return [J.bt[q.bay].position.clone(), 'TAP']; const c = J.cd.find(x => x.ok); return c ? [c.m.position.clone().add(V(0, 0.26, 0)), 'TAP'] : null; },
    shot() { return [V(LAD.position.x, 1.75, IZ + NZ), 2.8, 3.4, 0.12, 2.4, 0, 3.2]; },
    end() {} };
  const GD = { throne: G1, carpet: G2, announce: G3, chand: G4, council: G5, warmap: G6, shelve: G7, lost: G8 };
  const JB = castleJobsB({ THREE, G, GY, kit, V, box, cyl, LM, CT, IX, IZ, IY, OY, C, cols, colB, colR, tone, noise, ding, pop, thud, rub, trumpet, lab, lst, gauge, TAPR, dist, scrW, own, fly, walkTo, tagSprite, tagFor, nameTag, addGold, miss, NEXT, toast, finish: () => finishGame(), save, touch, ptr, keyS: () => keyS, hitPl, king, clamp, rnd, blotT, INK, YEL, GOLD, NAVY, WOOD, DARK, IRON, RED, fox: () => lastFox }); Object.assign(GD, JB.GD);
  // s100 PART C1: the 10 prizes (worlds/meru2-castle-prize.js)
  const PZ = casPrizes({ THREE, G, scene, kit, box, cyl, LM, CT, cols, colB, IX, IZ, IY, OY, save, wear, heal, toast, ding, tone, sayTo, hour, paint: JB.paint, PW: JB.PW, PH: JB.PH, castle, touch });
  // s113 PART C2: the life / look list (worlds/meru2-castle-life.js)
  const LF = casLife({ THREE, G, scene, kit, LM, CT, box, cyl, touch, hour, tone, noise, toast, camera, save, castle, IX, IZ, IY, OY, C });
  // ================= run a game =================
  function startGame(g, P, again) { if (busy || !GD[g]) return; const yard = !!GN[g].yard; try { LF.release(); } catch (e) {}
    if (P && !again && yard && inKeep(P)) { if (castle.leave) castle.leave(); setTimeout(() => startGame(g, lastP || P, true), 700); return; }
    if (P && !again && !yard && !inKeep(P)) { castle.enter(false); setTimeout(() => startGame(g, lastP || P, true), 700); return; }
    J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P, fy: yard ? OY : IY, par: yard ? GY : G }; busy = 'job'; const R = yard ? YRINGS_B[g] : RINGS[g];
    if (P && R) Object.assign(P, yard ? { x: R[0], z: R[1], sp: 0 } : { x: IX + R[0], z: IZ + R[1], sp: 0 }); GD[g].begin(P, J); K.chime(0.8); snapK = false; }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat(pre + 'Clears', save.stat(pre + 'Clears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const gf = PZ.onFinish(); thanks = { g, gold, by: GN[g].by, gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD', 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(J); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; walkers.length = 0; hideCard(); }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(J); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(J); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(J); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(J); if (!c) { hideCard(); return; } const lb = GN[J.g].by === 'l';
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? Math.floor(J.gold) + ' G' : lb ? 'LIBRARY' : 'COURT', lb ? LIB.color : STEW.color) + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt, J); if (!J) return; drawCard(); }
  // ---------- camera (jobs), clamped inside the job's room ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); camT.look.y += FYc(); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && GD[J.g].shot ? GD[J.g].shot(J) : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, (dt || 0.016) * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const rm = GN[J.g].room; if (rm === 'yard') { camCur.pos.x = clamp(camCur.pos.x, C.r[0] + 2.5, C.r[1] - 2.5); camCur.pos.z = clamp(camCur.pos.z, C.r[2] + 2.5, C.r[3] - 2.5); camCur.pos.y = clamp(camCur.pos.y, OY + 0.6, OY + 18); }
    else { const B = ROOMB[rm]; camCur.pos.x = clamp(camCur.pos.x, IX + B[0] + 0.5, IX + B[1] - 0.5); camCur.pos.z = clamp(camCur.pos.z, IZ + B[2] + 0.5, IZ + B[3] - 0.5); camCur.pos.y = clamp(camCur.pos.y, IY + 0.6, IY + B[4] - 0.4); } cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint(J) : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inKeep = P => !!castle.inside(P);
  const inYard = P => { const [a0, a1, c0, c1] = C.r; return P.x > a0 && P.x < a1 && P.z > c0 && P.z < c1 && Math.abs((P.y || 0) - OY) < 4; };
  const ringAt = P => { if (inKeep(P)) { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - IX - x, P.z - IZ - z) < 1.05) return k; } } else if (inYard(P)) { for (const k in YRINGS_B) { const [x, z] = YRINGS_B[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05) return k; } } return null; };
  const near = (o, P, r = 2.9) => !!o && Math.hypot(P.x - o.position.x, P.z - o.position.z) < r;
  function prompt(P) { if (busy) return null; { const pz = PZ.prompt(P); if (pz) return pz; } if (atStaff(P)) return 'STAFF DOOR \u00b7 CASTLE JOBS'; const r = ringAt(P); if (r) return (done()[r] ? '\u2713 ' : '') + 'START \u00b7 ' + GN[r].name.toUpperCase(); if (!inKeep(P)) return null;
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 SERVE THE KING'; if (near(stew, P)) return 'TALK \u00b7 ROYAL STEWARD'; if (near(lib, P)) return 'TALK \u00b7 ROYAL LIBRARIAN'; return null; }
  const nextJob = by => { const d = done(), L2 = GAMES.filter(q => !by || q.by === by); return (L2.find(q => !d[q.k]) || L2.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const say = (kT, lines, then) => { kT.ry = kT.obj.rotation.y; sayTo(kT, lines, then); };
  const sub = (kT, ln, by, title, grp) => say(kT, [{ ...ln(title), choices: [...GAMES.filter(q => q.by === by && (!grp || (q.grp || 'h') === grp)).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menu = (kT, ln, D, by, n, subs, aboutQ) => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(by), lastP); } }, ...subs.map(([label, grp, title]) => ({ text: label, pick: () => sub(kT, ln, by, title, grp) })),
      { text: aboutQ, pick: () => say(kT, D.about.map(a => ln(a[0]))) }, { text: 'A TIP, PLEASE', pick: () => say(kT, [ln(D.tips[n % D.tips.length])]) },
      ...(by === 's' ? [{ text: 'PRIZES + PERKS', pick: () => PZ.perks(kT, ln) }] : PZ.card() ? [{ text: 'READ A BOOK', pick: () => PZ.books(kT, ln) }] : []), { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = n === 0 ? D.hello[0] : D.hello[1 + (n % 3)]; if (thanks && thanks.by === by) { const thanks0 = thanks, gf = thanks.gf; thanks = null; if (gf) { open = PZ.line(gf)[0]; const pc = PZ.choices(gf); if (pc) { say(kT, [{ ...ln(open), choices: pc }]); return; } } else open = D.open[save.stat(pre + 'Clears', 1) % 4] + ' ' + Math.floor(thanks0.gold) + ' gold.'; }
    say(kT, [{ ...ln(open), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (PZ.talk(P)) return true; if (atStaff(P)) { tone(180, 0.06, 0.2, 'triangle'); tone(180, 0.06, 0.2, 'triangle', 0.22); castle.enter(false); setTimeout(() => toast('STAFF ENTRANCE \u00b7 STEWARD BARNABY IS BY THE DOOR', 3), 650); return true; }
    const r = ringAt(P); if (r) { startGame(r, P, true); return true; } if (!inKeep(P)) return false;
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (near(stew, P)) { tone(880, 0.05, 0.4); menu(kS, lnS, STEW, 's', talkS++, [['HALL + COUNCIL JOBS', 'h', 'Hall and council. Choose your post.'], ['TREASURY + YARD JOBS', 'y', 'Treasury and yard. Choose your post.']], 'WHAT DOES A STEWARD DO?'); return true; }
    if (near(lib, P)) { tone(740, 0.05, 0.4); menu(kL, lnL, LIB, 'l', talkL++, [['LIBRARY JOBS', null, 'Library jobs. Quietly, please.']], 'WHAT IS IN THE BOOKS?'); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // the Librarian: idle, wave when you walk into the library, look at you when close (the Steward gets this from the shop kit)
  let lWave = 0, lWas = false; const inLib = P => { const lx = P.x - IX, lz = P.z - IZ; return lx > -30 && lx < -10 && lz > -14 && lz < 2; };
  const turn = (o, a, k) => { let d = a - o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.rotation.y += d * Math.min(1, k); };
  function libTick(dt, t, P) { const inR = inLib(P); if (inR && !lWas) { lWave = busy ? 0 : 1.6; K.chime(0.6); } lWas = inR; const d = Math.hypot(P.x - lib.position.x, P.z - lib.position.z);
    if (d < 4.5 && inR) turn(lib, Math.atan2(P.x - lib.position.x, P.z - lib.position.z), dt * 3); else turn(lib, Math.PI / 2 + Math.sin(t * 0.5) * 0.15, dt * 1.5); kit.animFox(lib, dt, 0, false);
    if (LPOSE(lib, dt, lWave > 0 ? 'wave' : busy || d < 3 || !inR ? null : 'idle')) { if (lWave > 0) lWave -= dt; return; }
    const A = lib.userData.P && lib.userData.P.arms; if (A && lWave > 0) { lWave -= dt; A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(t * 14) * 0.35; } }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; const ink = inKeep(P); G.visible = ink; try { PZ.tick(dt, P, fox, busy === 'job'); } catch (e) { if (!PZ.err) { PZ.err = 1; console.warn('castle prizes: ' + (e && e.stack || e)); } }
    try { LF.tick(dt, P, { busy: !!busy, ink }); } catch (e) { if (!LF.err) { LF.err = 1; console.warn('castle life: ' + (e && e.stack || e)); } }
    if (busy === 'job' && J) { outT = (J.fy === OY ? inYard(P) : ink) ? 0 : outT + dt; if (outT > 0.3) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    try { JB.tick(dt, t, J); } catch (e) {}
    if (!ink && busy === 'job' && J) { if (fox && !GN[J.g].fox) JW(fox, J.g); for (const f of walkers.slice()) { if (!J.flies.some(q => q.obj === f)) walkers.splice(walkers.indexOf(f), 1); else kit.animFox(f, dt, 1.4, false); } jobTick(dt, P); hintTick(t); return; }
    { const h = hour(); if (lastH != null && lastH < 7 && h >= 7 && !(J && J.g === 'chand')) CH.forEach(c => setLitCh(c, false)); lastH = h; }
    if (!ink) { hintTick(t); return; } if (busy === 'job' && J && fox && !GN[J.g].fox) JW(fox, J.g);
    CH.forEach((c, i) => { if (c.lit || c.cand[0].visible) c.cand.forEach((f, k) => { if (f.visible) f.scale.set(1, 1 + Math.sin(t * 13 + k + i) * 0.2, 1); }); });
    if (J) for (const f of walkers.slice()) { if (!J.flies.some(q => q.obj === f)) walkers.splice(walkers.indexOf(f), 1); else kit.animFox(f, dt, 1.4, false); }
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t); libTick(dt, t, P);
    K.tick(dt, P, { inShop: ink, busy: !!busy, near: 0, talking: false }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), GD, RINGS, CH, stew, lib, K, JB, GY, PZ, LF, speedK: () => PZ.speedK(),
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint(J) : null), scr: v => scrW(v), finish: () => finishGame(), card, dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__castleJobs = API; return API;
}
