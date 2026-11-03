// MERU 2.0 — s63 SHOP KIT: the shared INTERIOR RULES (CLAUDE.md) every Town 2 shop uses. One call per shop:
//   const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix, color, room, door, keeper, keeperRy, games, board, hiring, sun, lamps, browse, looks, clock });
//   per frame: K.tick(dt, P, { inShop, busy })  ·  finish a game: K.finish(gameKey, stars, gold, first)  ·  NOW HIRING: K.atHiring(P)
// Gives: keeper idle + wave on entry + looks at you when close · 1-2 browsing customers by time of day (busier 13-17, none 20-7) · door chime ·
// sun patches + dust motes by day, lamp glow + darker corners at night · a wall clock with moving hands · stars + best board · badge fly-in.
import { applyPose, endPose, FOX_ANIMS } from '../engine/fox-poses.js?v=s648k';   // s617 jointed keepers
import { WS } from '../engine/world-sfx.js?v=s713';   // s712 Runway sounds (audio/meru)
// s618 each keeper's own job idle (by fox key), mixed into the shared loop; anyone not listed keeps wipe / hips / think
const KEEPER_IDLE = { snipBarber: ['k_snip'], grannyCrust: ['k_knead', 'w_till'], cocoa: ['k_stir'], bean: ['k_stir', 'w_till'], madameStitch: ['k_measure'], flora: ['k_arrange'], laceShoes: ['k_arrange'],
  gearsHobby: ['k_arrange', 'k_inspect'], hwTilly: ['k_arrange', 'w_till'], mrPenny: ['k_arrange', 'w_till'], mgrPlum: ['k_arrange', 'w_till'], stampsPost: ['k_count', 'k_clipboard'], bankManager: ['k_count', 'k_type'],
  officeLawyer: ['k_clipboard', 'k_phone'], officeAccountant: ['k_type', 'k_count'], officeDentist: ['k_clipboard', 'k_inspect'], drLimber: ['k_clipboard'], honeyHosp: ['k_clipboard', 'k_type'],
  relicGarden: ['k_inspect'], relicLakeside: ['k_inspect'], relicSpire: ['k_inspect'], relicDeco: ['k_inspect'], quillMuseum: ['k_inspect', 'k_clipboard'], galleryOwner: ['k_inspect', 'k_phone'], galleryPainter: ['k_arrange'],
  paperReporter: ['w_photo', 'k_phone', 'k_clipboard'], tabReporter: ['w_photo', 'k_phone'], tvAnchor: ['k_clipboard', 'k_phone'], radioDJ: ['k_dj'], mftOra: ['k_inspect'], mbrSizzle: ['grill_flip', 'w_dishes'],
  policeChief: ['k_clipboard', 'hips'], barracksGuardCaptain: ['k_clipboard', 'hips'], chiefEmber: ['k_clipboard', 'hips'], csBoss: ['k_count', 'hips'], casSteward: ['k_clipboard', 'k_arrange'], mpoSpade: ['k_clipboard', 'k_type'],
  bramKeeper: ['k_inspect', 'k_arrange'], fisherman: ['k_arrange'], reelBait: ['k_arrange', 'w_till'], mamaKeys: ['k_clipboard', 'k_count'], sirPercy: ['k_clipboard', 'hips'], birdieGolf: ['k_arrange'], railSkate: ['k_arrange'], bigTallRock: ['k_arrange'],
  mfEngineer: ['k_clipboard', 'k_phone'], pepperProperty: ['k_phone', 'k_clipboard'], saltConsigliere: ['k_phone', 'k_count'], vaxSales: ['k_phone', 'k_clipboard'], sgtBiscuit: ['k_arrange', 'k_count'], boltGas: ['k_count', 'k_arrange'], dotGas: ['k_count', 'k_arrange'], bhAce: ['k_clipboard'], mrsSage: ['k_inspect'],
  outletSkip: ['k_arrange'], outletPatch: ['k_arrange', 'k_count'], outletOllie: ['k_inspect', 'k_arrange'], outletBarnaby: ['k_arrange'], outletMagpieScoop: ['k_arrange', 'k_count'], rangeOfficer: ['k_clipboard', 'hips'] };
export const CHOICE_WORK = 'YES, PUT ME TO WORK!', CHOICE_BYE = 'GOODBYE';
export function shopKit(o) {
  const { THREE, G, kit, save, camera, touch } = o, R = o.room, hour = o.hour || (() => 12), muted = o.isMuted || (() => false);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); G.add(m); return m; };
  const night = () => { const h = hour(); return h >= 20 || h < 6; }, dayK = () => { const h = hour(); return h < 7 || h > 18.5 ? 0 : clamp(Math.min(h - 7, 18.5 - h) / 2, 0, 1); };
  // ---------- light: sun patches (window shape) + dust motes by day; lamp glow + dark corners at night ----------
  const winT = CT(128, 64, (g, W, H) => { const r = g.createLinearGradient(0, 0, W, 0); r.addColorStop(0, 'rgba(255,214,140,0.95)'); r.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = r; g.fillRect(6, 6, W - 12, H - 12); g.globalCompositeOperation = 'destination-out'; g.fillRect(0, H / 2 - 3, W, 6); g.fillRect(W * 0.32, 0, 6, H); });
  const sunM = new THREE.MeshBasicMaterial({ map: winT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const sunP = (o.sun || []).map(s => { const m = add(new THREE.PlaneGeometry(s.w, s.d), sunM, s.x, 0.09, s.z, -Math.PI / 2, 0); m.rotation.order = 'YXZ'; m.rotation.y = s.ry || 0; m.renderOrder = 2; return m; });
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const pts = (list, size, color, opacity = 1) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(list.flat()), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ map: glowT, size, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })); p.frustumCulled = false; G.add(p); return p; };
  const DN = touch ? 16 : 30, dust = (o.sun || []).length ? [...Array(DN)].map((_, i) => { const s = o.sun[i % o.sun.length]; return [s.x + rnd(-s.w, s.w) * 0.45, rnd(0.4, 2.6), s.z + rnd(-s.d, s.d) * 0.45, rnd(0, 9)]; }) : [];
  const DP = dust.length ? pts(dust.map(d => d.slice(0, 3)), 0.07, '#fff2d0', 0) : null;
  const LP = (o.lamps || []).length ? pts(o.lamps, 1.1, '#ffd38a', 0.85) : null; if (LP) LP.visible = false;
  const darkT = CT(64, 64, (g, W) => { const r = g.createRadialGradient(0, 0, 0, 0, 0, W); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const darkM = new THREE.MeshBasicMaterial({ map: darkT, transparent: true, depthWrite: false, opacity: 0 }), DK = [];
  { const s = Math.min(R.X1 - R.X0, R.Z1 - R.Z0) * 0.5; for (const [cx, cz, ry] of [[R.X0, R.Z0, 0], [R.X1, R.Z0, -Math.PI / 2], [R.X1, R.Z1, Math.PI], [R.X0, R.Z1, Math.PI / 2]]) { const g = new THREE.PlaneGeometry(s, s); g.translate(s / 2, -s / 2, 0); const m = add(g, darkM, cx, 0.085, cz, -Math.PI / 2, 0); m.rotation.order = 'YXZ'; m.rotation.y = ry; m.renderOrder = 2; DK.push(m); } }
  // ---------- wall clock (hands follow the game hour) ----------
  let hands = null; if (o.clock) { const c = o.clock, grp = new THREE.Group(); grp.position.set(c.x, c.y, c.z); grp.rotation.y = c.ry || 0; G.add(grp);
    grp.add(new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), new THREE.MeshBasicMaterial({ map: CT(128, 128, (g, W) => { g.fillStyle = '#201e1d'; g.beginPath(); g.arc(64, 64, 63, 0, 7); g.fill(); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); g.fillStyle = '#201e1d'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(64 + Math.sin(a) * 46 - 3, 64 - Math.cos(a) * 46 - 3, 6, 6); } g.fillStyle = o.color || '#ec3013'; g.fillRect(58, 14, 12, 8); }) })));
    const hand = (len, w, col) => { const h = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshBasicMaterial({ color: col })); m.position.set(0, len / 2 - 0.03, 0.01); h.add(m); h.position.z = 0.01; grp.add(h); return h; };
    hands = { h: hand(0.2, 0.04, '#201e1d'), m: hand(0.29, 0.025, '#201e1d'), s: hand(0.3, 0.012, o.color || '#ec3013') }; }
  // ---------- board: stars + best per game ----------
  const GAMES = o.games || [], SK = g => o.prefix + 'Star_' + g, BK = g => o.prefix + 'Best_' + g;
  const starP = (g, x, y, r, on) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fillStyle = on ? '#ffd23a' : '#d8d2c6'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#201e1d'; g.stroke(); };
  const BH = 70 + GAMES.length * 86, boardFn = (g, W, H) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, W, H); g.fillStyle = o.color || '#ec3013'; g.fillRect(0, 0, W, 58); g.fillStyle = '#ffffff'; g.font = '900 32px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText((o.boardTitle || 'BEST SCORES').toUpperCase(), 18, 31);
    GAMES.forEach((q, i) => { const y = 70 + i * 86; g.fillStyle = '#201e1d'; g.fillRect(0, y - 6, W, 3); g.font = '900 26px Archivo, sans-serif'; g.fillText(q.name.toUpperCase(), 18, y + 22); const st = save.stat(SK(q.k), 0); for (let s = 0; s < 3; s++) starP(g, 32 + s * 38, y + 58, 15, s < st); g.font = '800 22px Archivo, sans-serif'; const b = save.stat(BK(q.k), 0); g.fillText(b ? 'BEST ' + b + ' G' : 'NOT PLAYED YET', 150, y + 59); }); };
  let boardTex = null, boardAt = null; if (o.board && GAMES.length) { const b = o.board, w = b.w || 1.5, h = w * BH / 512; boardTex = CT(512, BH, boardFn); const fr = add(new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.04), new THREE.MeshLambertMaterial({ color: '#201e1d' }), b.x, b.y, b.z, 0, b.ry || 0); fr.translateZ(-0.03); add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: boardTex }), b.x, b.y, b.z, 0, b.ry || 0); boardAt = V(b.x, b.y, b.z); }
  const redraw = () => { if (!boardTex) return; boardFn(boardTex.userData.c.getContext('2d'), 512, BH); boardTex.needsUpdate = true; };
  // ---------- badge fly-in (DOM, Modernist) ----------
  const WIN = document.createElement('div'); WIN.style.cssText = 'position:fixed;left:50%;top:40%;z-index:31;pointer-events:none;display:none;font-family:Archivo,sans-serif'; document.body.appendChild(WIN);
  const TW = o.toWorld || (v => v), scr = v => { const p = TW(v.clone()).project(camera); return [(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight, p.z]; };
  function finish(g, stars, gold, first) { const q = (o.allGames || GAMES).find(x => x.k === g) || { k: g, name: g }; stars = clamp(Math.round(stars), 1, 3); try { window.__m2react = stars >= 3 ? 'jig' : stars === 2 ? 'cheer' : 'facepalm'; } catch (e) {}   /* s633: your fox reacts when a job ends (the walk plays it) */ const isNew = stars > save.stat(SK(g), 0); if (isNew) save.setStat(SK(g), stars); if (gold > save.stat(BK(g), 0)) save.setStat(BK(g), gold); redraw();
    const st = [0, 1, 2].map(i => '<span style="color:' + (i < stars ? '#ffd23a' : '#cfcac3') + ';-webkit-text-stroke:1.5px #201e1d">\u2605</span>').join('');
    WIN.innerHTML = '<div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px;transform:translate(-48px,-48px)"><div style="width:96px;height:96px;box-sizing:border-box;border-radius:50%;background:' + (q.color || o.color || '#ec3013') + ';border:4px solid #201e1d;display:flex;align-items:center;justify-content:center;color:#fff;font:900 48px Archivo,sans-serif">\u2713</div><div style="background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:4px 8px;white-space:nowrap">' + (first ? 'FIRST CLEAR \u00b7 ' : isNew ? 'NEW BEST \u00b7 ' : '') + q.name.toUpperCase() + (gold ? ' \u00b7 +' + gold + ' G' : '') + '</div><div style="font-size:30px;line-height:1;letter-spacing:3px;background:#f3f2f2;border:2px solid #201e1d;padding:3px 8px 4px">' + st + '</div></div>';
    Object.assign(WIN.style, { transition: 'none', left: '50%', top: '40%', display: 'block', opacity: '0', transform: 'scale(0.3)' }); void WIN.offsetWidth; WIN.style.transition = 'transform .35s cubic-bezier(.3,1.6,.5,1), opacity .2s'; WIN.style.opacity = '1'; WIN.style.transform = 'scale(1)'; chime(1.2);
    setTimeout(() => { const w = boardAt ? scr(boardAt) : [0, 0, 2], on = w[2] < 1 && w[0] > 0 && w[0] < innerWidth && w[1] > 0 && w[1] < innerHeight; WIN.style.transition = 'left .6s ease-in, top .6s ease-in, transform .6s ease-in, opacity .6s ease-in'; WIN.style.left = Math.round(on ? w[0] : 56) + 'px'; WIN.style.top = Math.round(on ? w[1] : 110) + 'px'; WIN.style.transform = 'scale(0.22)'; WIN.style.opacity = on ? '0.9' : '0'; setTimeout(() => { WIN.style.display = 'none'; }, 640); }, 1500);
    return stars; }
  // ---------- NOW HIRING sign (walk up + E starts the job) ----------
  let hireAt = null; if (o.hiring) { const h = o.hiring, grp = new THREE.Group(); grp.position.set(h.x, 0, h.z); grp.rotation.y = h.ry || 0; G.add(grp); const wd = new THREE.MeshLambertMaterial({ color: '#201e1d' });
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.06), wd); l.position.set(s * 0.36, 0.65, 0); grp.add(l); }
    const t = CT(256, 160, (g, W, H) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, W, H); g.strokeStyle = '#f3f2f2'; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16); g.fillStyle = '#ffffff'; g.font = '900 46px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NOW', 22, 50); g.fillText('HIRING', 22, 98); g.fillStyle = '#ffd23a'; g.font = '900 20px Archivo, sans-serif'; g.fillText(o.hiringLine || 'WALK UP \u00b7 START WORK', 22, 136); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.52), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); p.position.y = 1.2; grp.add(p); hireAt = { x: h.x + Math.sin(h.ry || 0) * 0.8, z: h.z + Math.cos(h.ry || 0) * 0.8 }; }
  const atHiring = P => !!hireAt && Math.hypot(P.x - hireAt.x, P.z - hireAt.z) < 1.1 && (P.y || 0) < 2;
  // ---------- sound: door chime ----------
  let ac = null; function chime(k = 1) { if (muted()) return; if (WS.play('shop-bell', 0.55 * k)) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime; [[1318, 0], [1046, 0.16]].forEach(([f, at]) => { const os = ac.createOscillator(), gn = ac.createGain(); os.frequency.value = f; gn.gain.setValueAtTime(0.05 * k, t + at); gn.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.9); os.connect(gn).connect(ac.destination); os.start(t + at); os.stop(t + at + 0.9); }); } catch (e) {} }
  // ---------- customers: 1-2 browse by time of day ----------
  const BR = o.browse || [], DOOR = o.door, LOOKS = o.looks || [['#2e86b8', '#22648a', '#16435c'], ['#7c4dc4', '#5e3a96', '#3d2563'], ['#3f9a5e', '#2e7a46', '#1e5230']];
  // s77: o.visitors(h) → [{ r, kind: 'browse' | 'through', why }] from worlds/meru2-roster.js = the town's real foxes (other shops' staff on their way to / from work,
  // guards / police / fire crew on their beat); o.visitorFox(r) gives that fox, o.onVisit(entry) is told when one walks in. Without visitors: the old anonymous browsers.
  const VIS = o.visitors, SLOTS = o.slots || 2;
  const CU = !BR.length ? [] : VIS ? [...Array(SLOTS).keys()].map(i => ({ f: null, st: 'off', cd: rnd(1, 3) + i * 4, path: [], wait: 0, who: null }))
    : [0, 1].map(i => { const f = kit.makeFox({ key: o.prefix + 'Browse' + i, torso: LOOKS[i % LOOKS.length], outfit: i ? 'coat' : 'vest', mood: 'happy', joints: true }); f.userData.crowd = true; f.visible = false; G.add(f); return { f, st: 'off', cd: rnd(2, 8) + i * 9, path: [], wait: 0 }; });
  const want = () => { const h = hour(); return h < 8 || h >= 20 ? 0 : h >= 13 && h < 17 ? 2 : 1; };
  const turn = (obj, a, k) => { let d = a - obj.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); obj.rotation.y += d * Math.min(1, k); };
  const seen = new Map();   // roster key → hour they last walked in (one visit per window)
  const offC = (c, cd) => { if (c.f && c.bp) endBrowse(c, c.f); if (c.f) c.f.visible = false; c.st = 'off'; c.cd = cd; if (VIS) { c.who = null; c.f = null; } };
  function spawn(c, P, inShop) { let pick, entry = null;
    if (VIS) { const h = hour(), onK = new Set(CU.filter(q => q.who).map(q => q.who.r.key)); const due = VIS(h).filter(e => !onK.has(e.r.key) && !(seen.has(e.r.key) && Math.abs(h - seen.get(e.r.key)) < 1.2));
      if (!due.length) return false; entry = due.find(e => e.kind === 'through') || due[Math.random() * due.length | 0]; c.who = entry; c.f = o.visitorFox(entry.r); seen.set(entry.r.key, h); }
    const f = c.f; if (!f) return false;
    if (entry && entry.kind === 'through') { const T = BR[Math.random() * BR.length | 0]; pick = [[T[0], T[1], T[2], false, 1.4]]; }
    else { const k = 2 + (Math.random() * 2 | 0); pick = [...BR].sort(() => Math.random() - 0.5).slice(0, k); }
    c.path = [...pick, [DOOR[0], DOOR[1], null, true]]; f.position.set(DOOR[0], 0, DOOR[1]); f.visible = true; c.st = 'walk';
    if (entry && o.onVisit) try { o.onVisit(entry, inShop); } catch (e) {} return true; }
  // s618 BROWSING: at each stop a jointed customer picks something up + looks it over, or browses the shelf with a paw on the chin; the stop
  // lasts the whole move. Unjointed visitors (town foxes) get a simple reach-and-look with the arm.
  function browsePose(c, f, dt) { const J = f.userData.P && f.userData.P.fore;
    if (!c.bp) { c.bp = { a: Math.random() < 0.6 ? 'browse_pick' : 'browse_look', t: 0, k: 0 }; if (J) c.wait = Math.max(c.wait, FOX_ANIMS[c.bp.a].dur); }
    const B = c.bp; B.t += dt; B.k = Math.min(1, B.k + dt * 3);
    if (J) { applyPose(THREE, f, B.a, Math.min(B.t, FOX_ANIMS[B.a].dur - 0.01), B.k); return; }
    const A = f.userData.P && f.userData.P.arms; if (!A) return; const r = Math.sin(Math.min(1, B.t / 3.6) * Math.PI); A[1].rotation.x = -1.2 * r; A[1].rotation.z = 0.1 * r; if (f.userData.P.head) f.userData.P.head.rotation.x = 0.2 * r; }
  function endBrowse(c, f) { if (c.bp && f.userData.P && f.userData.P.fore) endPose(f); c.bp = null; }
  function custTick(dt, P, busy, inShop, clear) { const n = busy ? 0 : VIS ? SLOTS : want(); let on = CU.filter(c => c.st !== 'off').length;
    for (const c of CU) { const f = c.f;
      if (c.st === 'off') { c.cd -= dt; if (!busy && on < n && c.cd <= 0) { if (spawn(c, P, inShop)) { on++; CU.forEach(q => { if (q.st === 'off') q.cd = Math.max(q.cd, rnd(VIS ? 3 : 6, VIS ? 6 : 12)); }); } else c.cd = rnd(2, 4); } continue; }
      if (busy || !f) { offC(c, rnd(4, 10)); continue; }
      if (clear && Math.hypot(f.position.x - clear[0], f.position.z - clear[1]) < clear[2]) { offC(c, rnd(6, 10)); continue; }   // s77: keep a shot (e.g. the end talk) clear
      const T = c.path[0]; if (!T) { offC(c, rnd(10, 25)); continue; }
      if (c.st === 'look') { c.wait -= dt; if (T[2] != null) turn(f, T[2], dt * 4); kit.animFox && kit.animFox(f, dt, 0); browsePose(c, f, dt); if (c.wait <= 0) { c.path.shift(); c.st = 'walk'; endBrowse(c, f); } continue; }
      const dx = T[0] - f.position.x, dz = T[1] - f.position.z, d = Math.hypot(dx, dz), sp = 1.15;
      if (d < 0.08) { if (T[3]) { offC(c, rnd(VIS ? 4 : 10, VIS ? 9 : 25)); continue; } c.st = 'look'; c.wait = T[4] || rnd(3, 6.5); continue; }
      const pd = Math.hypot(P.x - f.position.x, P.z - f.position.z); if (pd < 0.9 && (c.blk = (c.blk || 0) + dt) < 1.2) { kit.animFox && kit.animFox(f, dt, 0); continue; } if (pd >= 0.9) c.blk = 0;   // pause a moment for the player, then step past
      turn(f, Math.atan2(dx, dz), dt * 8); const st = Math.min(d, sp * dt); f.position.x += dx / d * st; f.position.z += dz / d * st; kit.animFox && kit.animFox(f, dt, sp); } }
  // ---------- keeper: idle, wave when you walk in, look at you when close ----------
  const KP = o.keeper, kRy = o.keeperRy ?? (KP ? KP.rotation.y : 0); if (KP) { KP.userData.rosterRole = 'keeper'; KP.userData.rosterShop = o.boardTitle || ''; }   // s104g: CHARACTER ROSTER
  let waveT = 0, wasIn = false, idleT = 0;
  function keeperTick(dt, t, P, inShop, busy, talking) { if (!KP) return; if (inShop && !wasIn) { waveT = busy ? 0 : (KP && KP.userData.P && KP.userData.P.fore ? 2.7 : 1.8); chime(); } wasIn = inShop;
    if (!inShop && K.away && K.away()) { if (KP.visible) { KP.visible = false; KP.userData.tlHid = true; } return; } if (KP.userData.tlHid) { KP.visible = true; KP.userData.tlHid = false; }   // s143 TOWN LIFE: home after closing
    const d = Math.hypot(P.x - KP.position.x, P.z - KP.position.z); if (!talking) { if (inShop && d < 4.5) turn(KP, Math.atan2(P.x - KP.position.x, P.z - KP.position.z), dt * 3); else turn(KP, kRy + Math.sin(t * 0.6) * 0.18, dt * 1.5); }
    kit.animFox && kit.animFox(KP, dt, 0);
    if (KP.userData.P && KP.userData.P.fore) { keeperPose(dt, t, d, busy, talking); return; }
    const A = KP.userData.P && KP.userData.P.arms; if (!A || talking) return;
    if (waveT > 0) { waveT -= dt; A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(t * 14) * 0.35; return; }
    if (busy || d < 3) return; idleT += dt; const ph = idleT % 12; if (ph > 6 && ph < 8.2) { const k = Math.sin((ph - 6) / 2.2 * Math.PI); A[0].rotation.x = -1.3 * k; A[0].rotation.z = -0.3 * k; } else if (ph > 9 && ph < 10.6) { A[1].rotation.x = -0.8 + Math.sin(t * 9) * 0.1; } }
  // s617 JOINTED KEEPER: a real WAVE (palm to you, forearm swing) when you walk in, then a slow idle loop of shop-keeper moves (wipe the
  // counter, hands on hips, thinking, a little proud stance); while you are close or talking they just stand easy and face you.
  const KI = KP && (KEEPER_IDLE[KP.userData.foxKey] || []).filter(k => FOX_ANIMS[k]), KL = KI && KI.length ? [KI[0], 'hips', KI[1] || KI[0], 'think', KI[0], 'bar_wipe'] : ['bar_wipe', 'hips', 'bar_wipe', 'think'], KS = { a: null, t: 0, k: 0, i: 0 };
  function keeperPose(dt, t, d, busy, talking) { let name = null;
    if (waveT > 0) { waveT -= dt; name = 'wave'; } else if (!talking && !busy && d >= 3) { name = KL[KS.i]; }
    if (name && name !== KS.a) { KS.a = name; KS.t = 0; } if (!name || !FOX_ANIMS[name]) { KS.k = Math.max(0, KS.k - dt * 3); if (KS.k <= 0 && KS.a) { endPose(KP); KS.a = null; return; } if (KS.a) applyPose(THREE, KP, KS.a, KS.t, KS.k); return; }
    KS.t += dt; if (name !== 'wave' && KS.t >= FOX_ANIMS[name].dur) { KS.t = 0; KS.i = (KS.i + 1) % KL.length; KS.a = KL[KS.i]; name = KS.a; }
    KS.k = Math.min(1, KS.k + dt * 3); applyPose(THREE, KP, name, KS.t, KS.k); }
  // ---------- per frame ----------
  let lastNight = null;
  function tick(dt, P, s = {}) { const t = performance.now() / 1000, inShop = !!s.inShop, busy = !!s.busy, close = s.near ?? (inShop ? 0 : 99);
    keeperTick(dt, t, P, inShop, busy, !!s.talking); if (close < 40) custTick(dt, P, busy, inShop, s.clear); else CU.forEach(c => { if (c.st !== 'off') offC(c, rnd(2, 5)); });
    if (inShop && o.camera) { const cp = o.camera.position, cd = f => { const w = TW(f.position.clone()); return Math.hypot(w.x - cp.x, w.z - cp.z); };   // s68: never let a fox fill the lens
      CU.forEach(c => { if (c.st !== 'off' && c.f) c.f.visible = cd(c.f) > 1.3; });
      if (KP) { const hide = !s.talking && cd(KP) < 1.1; if (hide) { KP.visible = false; KP.userData.camHid = true; } else if (KP.userData.camHid) { KP.visible = true; KP.userData.camHid = false; } } }
    const nt = night(); if (nt !== lastNight) { lastNight = nt; if (LP) LP.visible = nt; darkM.opacity = nt ? 0.5 : 0; } if (LP && o.lampsOn) LP.visible = nt && !!o.lampsOn();
    const dk = dayK(); sunM.opacity = dk * 0.42; sunP.forEach(m => { m.visible = dk > 0.02; });
    if (DP) { DP.visible = dk > 0.02 && inShop; DP.material.opacity = dk * 0.75; if (DP.visible) { const a = DP.geometry.attributes.position.array; dust.forEach((d, i) => { a[i * 3] = d[0] + Math.sin(t * 0.3 + d[3]) * 0.25; a[i * 3 + 1] = 0.4 + ((d[1] + t * 0.05 + d[3]) % 2.3); a[i * 3 + 2] = d[2] + Math.cos(t * 0.23 + d[3]) * 0.25; }); DP.geometry.attributes.position.needsUpdate = true; } }
    if (hands && inShop) { const h = hour() % 12, mm = (t / 60) % 1; hands.h.rotation.z = -h / 12 * Math.PI * 2; hands.m.rotation.z = -mm * Math.PI * 2; hands.s.rotation.z = -(t % 60) / 60 * Math.PI * 2; } }
  const K = { tick, finish, atHiring, chime, redraw, stars: g => save.stat(SK(g), 0), best: g => save.stat(BK(g), 0), customers: CU, dispose() { WIN.remove(); }, keeper: KP, title: o.boardTitle || '', away: null,
    doorWorld: () => { if (!DOOR) return null; const v = V(DOOR[0], 0, DOOR[1]); if (o.toWorld) return o.toWorld(v); G.updateMatrixWorld(true); return G.localToWorld(v); } };
  (window.__shopKits = window.__shopKits || []).push(K);   // s143 TOWN LIFE reads every kit (worlds/meru2-townlife.js)
  return K;
}
