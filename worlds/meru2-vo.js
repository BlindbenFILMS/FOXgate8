// MERU 2.0 — VOICE PACK (s150c). The census recordings (meru_voice/meru_voice.json, 1,976 rows) for every fox in Meru:
// · lineFor(text) → clip url for a dialogue line (exact text match, then the first 40 letters), any speaker incl. FOX (= Ben)
// · greetFor(name) → a random short clip (≤ 4 s) of that fox, for the proximity greetings
// Files: MERU/vo/<id>.mp3 if the pack is copied into the project, else the 3D-foxgate8 repo (jsDelivr, then raw GitHub).
const BASES = ['MERU/vo/', 'https://cdn.jsdelivr.net/gh/BlindbenFILMS/3D-foxgate8@main/meru_voice/vo/', 'https://raw.githubusercontent.com/BlindbenFILMS/3D-foxgate8/main/meru_voice/vo/'];
const norm = t => String(t || '').toLowerCase().replace(/\u2019/g, "'").replace(/[^a-z0-9]+/g, ' ').trim();
// s181 VOICE PACK 2 (meru_voice_2/meru_voice_2.json, 681 rows): same vo/ names, no clashes; clips from MERU/vo/ or the repo's meru_voice_2/vo/
const BASES2 = ['MERU/vo/', 'https://cdn.jsdelivr.net/gh/BlindbenFILMS/3D-foxgate8@main/meru_voice_2/vo/', 'https://raw.githubusercontent.com/BlindbenFILMS/3D-foxgate8/main/meru_voice_2/vo/'];
const V = { base2: null, p2: new Set(), proxL: new Map(), crowd: { MAN: [], WOMAN: [], ELDER: [], KID: [] }, base: null, byText: new Map(), byPre: new Map(), byFox: new Map(), scenes: new Map(), prox: new Map(), ready: false };
const ready = (async () => {
  const add = c => { if (/-prox\d*$/.test(c.id)) { if (!V.proxL.has(c.fox)) V.proxL.set(c.fox, []); V.proxL.get(c.fox).push(c.id); const m = c.fox.match(/^TOWNSFOLK (MAN|WOMAN|ELDER|KID)$/); if (m) V.crowd[m[1]].push(c); } };
  try { const j2 = await (await fetch('meru_voice_2/meru_voice_2.json')).json(); for (const c of j2.items) { V.p2.add(c.id); add(c); if (!V.scenes.has(c.scene)) V.scenes.set(c.scene, []); V.scenes.get(c.scene).push(c); const n = norm(c.text); if (!V.byText.has(n)) V.byText.set(n, c.id); if (c.fox !== 'FOX' && c.seconds <= 6) { const f = c.fox.toUpperCase(); if (!V.byFox.has(f)) V.byFox.set(f, []); V.byFox.get(f).push(c.id); } } } catch (e) {}
  try { const j = await (await fetch('meru_voice/meru_voice.json')).json();
    for (const c of j.items) { add(c); if (!V.scenes.has(c.scene)) V.scenes.set(c.scene, []); V.scenes.get(c.scene).push(c); if (/-prox$/.test(c.id) && !V.prox.has(c.fox)) V.prox.set(c.fox, c.id); const n = norm(c.text); if (!V.byText.has(n)) V.byText.set(n, c.id); const p = n.slice(0, 40); if (p.length >= 24 && !V.byPre.has(p)) V.byPre.set(p, c.id);
      if (c.fox !== 'FOX' && c.seconds <= 6) { const f = c.fox.toUpperCase(); if (!V.byFox.has(f)) V.byFox.set(f, []); V.byFox.get(f).push(c.id); } } } catch (e) {}
  V.base2 = BASES2[1];   /* s181: pack 2 clips confirmed on jsDelivr: no probe fetch at load (the probe kept the chat preview's loading screen up) */
  for (const b of BASES) { try { const r = await fetch(b + 'plaza-chess-01.mp3', { method: b.startsWith('http') ? 'GET' : 'HEAD' }); if (r.ok) { V.base = b; break; } } catch (e) {} }
  V.ready = true; })();
const url = id => { if (!id) return null; const b = V.p2.has(id) ? V.base2 : V.base; return b ? b + id + '.mp3' : null; };
export const VO = {
  ready, V,
  lineFor(text) { if (!V.base && !V.base2) return null; const n = norm(text); return url(V.byText.get(n) || V.byPre.get(n.slice(0, 40))); },
  greetFor(name) { if ((!V.base && !V.base2) || !name) return null; const k = String(name).toUpperCase().replace(/\./g, '').trim(), L = V.byFox.get(k) || V.byFox.get(k.replace(/^(MR|MRS|MS|SGT|DR) /, '')); const pl = V.proxL.get(k), px = pl && pl.length ? pl[Math.floor(Math.random() * pl.length)] : V.prox.get(k); if (px && (!L || Math.random() < 0.5)) return url(px); return L && L.length ? url(L[Math.floor(Math.random() * L.length)]) : null; },
  // speaker key → census fox name: its spec name, the camelCase key spelled out, the key itself, a census fox ending with it, then the aliases
  foxForKey(key, names = []) { const ALIAS = { castleGuard1: 'CASTLE GUARD ONE', castleGuard2: 'CASTLE GUARD TWO', arenaGuard1: 'ARENA GUARD GATE', arenaGuard2: 'ARENA GUARD ROAD', arenaRoadGuard1: 'ROAD GUARD LOWER', arenaRoadGuard2: 'ROAD GUARD UPPER', arenaGate: 'GATE KEEPER', defGuard1: 'BASE GUARD ONE', defGuard2: 'BASE GUARD TWO', aptDoorCrest: 'CRESTVIEW DOORMAN', aptDoorLake: 'LAKESIDE APTS DOORMAN', arenaStall2: 'STALLHOLDER TWO', arenaStall3: 'STALLHOLDER THREE', lanesKeeper: 'MOTT', lanesRegular: 'GALE', lanesRecord: 'NERA', lanesRival: 'ROOK', king: 'KING MIGHT', sage: 'OLD SAGE', burgerCook: 'SIZZLE', michaelJay: 'MICHAEL JAY', barkeep: 'BARKEEP', docBraun: 'DOC BRAUN', deliveryBun: 'BUN', darterFlick: 'FLICK', pearlLocal1: 'PEARL LOCAL ONE', pearlLocal2: 'PEARL LOCAL TWO', casinoPoker1: 'STUD DEALER', casinoPoker2: 'HOLDEM DEALER', casinoWheel: 'WHEEL HOST', casinoCashier: 'CAGE CASHIER', bowlerDash: 'DASH', bowlerPiper: 'PIPER', bankVault: 'VAULT CLERK', rentalClerk2: 'RENTAL CLERK', ticketClerk: 'CONDUCTOR', trainConductor: 'CONDUCTOR', barracksGuardCaptain: 'GUARD CAPTAIN', barracksMasterOfArms: 'MASTER OF ARMS', defTech1: 'RADAR TECH', defTech2: 'SYSTEMS TECH', aptRealCrest: 'HAZEL', aptRealLake: 'JUNO KEEPER', ruinsGuard: 'GATE KEEPER', jon: 'JOB', mike: 'MICHAEL JAY TWO', james: 'GRAND', vance: 'ULRIC' };
    const cands = [...names, ...names.map(n => String(n || '').replace(/^Mr\.? /i, 'Mister ').replace(/^Dr\.? /i, 'Doctor ').replace(/^Sgt\.? /i, 'Sergeant ')), key.replace(/([a-z])([A-Z0-9])/g, '$1 $2'), key, ALIAS[key]].filter(Boolean).map(s => String(s).toUpperCase().replace(/\./g, '').trim());
    for (const c of cands) if (V.byFox.has(c) || V.prox.has(c)) return c; const k = key.toUpperCase().replace(/END$/, ''); for (const f of [...V.byFox.keys(), ...V.prox.keys()]) if (f.endsWith(' ' + k) || f.replace(/ /g, '') === k) return f; return null; },
  // the census talk for a fox: its 1-on-1 scene (only that fox + FOX), as dialogue lines { who: 'player' | 'npc', text, vo }
  talkFor(fox) { if (!fox) return null; let best = null; for (const [sc, rows] of V.scenes) { const who = new Set(rows.map(r => r.fox)); if (!who.has(fox) || !who.has('FOX') || who.size !== 2) continue; if (!best || rows.length > best.length) best = rows; }
    return best && best.map(r => ({ who: r.fox === 'FOX' ? 'player' : 'npc', text: r.text, vo: r.id })); },
  urlOf(id) { return url(id); },
  // the census talk as a choice tree: { intro: [lines], qs: [{ q, ans: [lines] }], bye: { q, ans } } from ids like lanes-gale-01 / -q1 / -a1a / -qbye / -bye
  treeForScene(sc) { const rows = V.scenes.get(sc); return rows ? VO.tree(rows) : null; },
  treeFor(fox) { if (!fox) return null; const all = []; for (const [sc, rs] of V.scenes) { const who = new Set(rs.map(r => r.fox)); if (who.has(fox) && who.has('FOX') && who.size === 2) all.push(rs); } if (!all.length) return null;
    all.sort((a, b) => (V.p2.has(a[0].id) - V.p2.has(b[0].id)) || b.length - a.length); const T = VO.tree(all[0]); for (const rs of all.slice(1)) { const t = VO.tree(rs); T.qs.push(...t.qs); if (!T.bye && t.bye) T.bye = t.bye; if (!T.intro.length) T.intro = t.intro; } return T; },   /* s181: pack 1 talk first, pack 2 questions added to the menu */
  // s181 crowd: a random TOWNSFOLK line { text, vo } for a crowd fox's voice (MAN | WOMAN | ELDER | KID)
  crowd(kind) { const L = V.crowd[kind] || V.crowd.MAN; if (!L.length) return null; const c = L[Math.floor(Math.random() * L.length)]; return { text: c.text, vo: c.id }; },
  tree(rows) {
    const L = r => ({ who: r.fox === 'FOX' ? 'player' : 'npc', text: r.text, vo: r.id }), T = { intro: [], qs: [], bye: null }, byQ = {};
    for (const r of rows) { const s = r.id.slice(r.id.lastIndexOf('-') + 1); if (/^prox\d*$/.test(s)) continue; if (/^\d+$/.test(s)) T.intro.push(L(r));
      else if (s === 'qbye') T.bye = { q: L(r), ans: [] }; else if (s === 'bye') { if (!T.bye) T.bye = { q: null, ans: [] }; T.bye.ans.push(L(r)); }
      else if (/^q\d+$/.test(s)) { byQ[s.slice(1)] = { q: L(r), ans: [] }; T.qs.push(byQ[s.slice(1)]); } else { const m = s.match(/^a(\d+)/); if (m && byQ[m[1]]) byQ[m[1]].ans.push(L(r)); } }
    return T; },
  hasFox(name) { const k = String(name || '').toUpperCase(); return !!(V.byFox.get(k) || V.prox.get(k)); },
};
if (typeof globalThis !== 'undefined') globalThis.__m2VO = VO;

// cluster / HQ speakers → their census scene (s150f)
export const VOX_SCENES = { vaxReception: 'gi-glossa', vaxCEO: 'gi-vax', vaxSales: 'gi-penn', vaxSecurity: 'gi-sec', psManager: 'gi-coral-pre', tvManager: 'gi-tvmgr', tvAnchor: 'gi-anchor', tvWeather: 'gi-weather', tvCamera: 'gi-camera',
  galleryOwner: 'gi-gowner', galleryPainter: 'gi-painter', gallerySculptor: 'gi-sculpt', gaptManager: 'gi-gmgr', gaptDoor: 'gi-gdoor', gaptTenant: 'gi-gten', relicGarden: 'gi-relic',
  saltDesk: 'sa-brine', saltBoss: 'sa-boss', saltBossBack: 'sa-boss', saltConsigliere: 'sa-lawyer', saltDoor0: 'sa-door', saltDoor1: 'sa-door', saltCousin: 'sa-cousin-pre', saltCousinIn: 'sa-cousin-post', tabEditor: 'sa-editor', tabReporter: 'sa-reporter', tabIntern: 'sa-intern',
  dumpForeman: 'sa-foreman', dumpPicker: 'sa-picker', dumpDriver: 'sa-driver', laptManager: 'sa-mgr', laptDoor: 'sa-aptdoor', relicLakeside: 'sa-relic',
  mfDesk: 'sp-desk', mfDirector: 'sp-cogs', mfEngineer: 'sp-eng', mfGuardBot: 'sp-mguard', mfForeman: 'sp-foreman-pre', mfForemanIn: 'sp-foreman-post', radioManager: 'sp-rmgr', radioDJ: 'sp-dj', radioTech: 'sp-rtech',
  officeLobby: 'sp-lobby', officeLawyer: 'sp-lawyer', officeLawClerk: 'sp-lclerk', officeAccountant: 'sp-acct', officeDentist: 'sp-dent', officeNurse: 'sp-dnurse', saptManager: 'sp-smgr', saptDoor: 'sp-sdoor', relicSpire: 'sp-relic',
  pepperDesk: 'de-desk', pepperBoss: 'de-boss', pepperBossBack: 'de-boss', pepperProperty: 'de-prop', pepperDoor0: 'de-door', pepperDoor1: 'de-door', pepperCousin: 'de-cousin-pre', pepperCousinIn: 'de-cousin-post', paperEditor: 'de-editor', paperReporter: 'de-ace', paperSeller: 'de-seller', paperPress: 'de-press',
  woodMaster: 'de-wood', woodApprentice: 'de-app', daptManager: 'de-mgr', daptDoor: 'de-aptdoor', daptTenant: 'de-tenant', relicDeco: 'de-relic', saltBandit: 'sa-bandit', pepperBandit: 'de-bandit',
  dockGuardA: 'dk-berth', dockGuardB: 'dk-gantry', chiefEmber: 'fire-chief', fireDriver: 'fire-axle', fireLadder: 'fire-rung', fireHose: 'fire-spritz', fireSpritz: 'fire-spritz', ticketClerk: 'loop-square', max: 'mt-max', princessMichelle: 'mt-michelle', michelle: 'mt-michelle',
  pearlDiver: 'pi-diver', ferryCaptain: 'lk-ferry', courtSteward: 'ct-steward', castleSteward: 'ct-steward', hospitalDoctor: 'hs-rounds', doctorRounds: 'hs-rounds' };
