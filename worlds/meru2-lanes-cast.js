// MERU 2.0 — s115 MERU LANES DELUXE PART B2: the 2D cast's challenges, on the 3D tenpin (worlds/meru2-bowling.js, lane 4).
// ROOK (lanesRival): BOWL AGAINST ME = beat 147 · NERA (lanesRecord): TAKE THE HOUSE = beat 212 · GALE (lanesRegular): LEAGUE NIGHT (18-23 h: you + Gale
// vs Rook + Dash, team totals) + SPARE DRILLS (7-10 split, 10 pin, 7 pin, bucket, baby split; 3 balls each). Their 2D lines stay verbatim in the menus.
// Results come back from the tenpin as window events 8g:tenpinDone { total } / 8g:tenpinDrill { hits, n }.
const L2D = {
  lanesRegular: [{ who: 'player', text: 'How is it going?' }, { who: 'npc', text: 'Do not. Mott sent you over to ask that, and he does it to everyone.' },
    { who: 'npc', text: 'Forty-one weeks against ROOK. Forty-one. I have beaten him on the first ball, on the fifth frame, on the ninth \u2014 and never once at the end of it.' },
    { who: 'player', text: 'What does he do differently?' }, { who: 'npc', text: 'Nothing! That is the horror of it. Same line, same speed, same little nod before he lets go. No spin, no risk, no flair.' },
    { who: 'npc', text: 'I throw a beautiful ball. Absolutely beautiful. And then I throw a gutter, and he throws his hundred and forty-seventh pin, and we go home.' },
    { who: 'player', text: 'Any advice for the lanes?' }, { who: 'npc', text: 'Start left of centre and let it drift in. And do not chase a strike on the second ball \u2014 a spare counts, and a gutter counts for nothing.' },
    { who: 'npc', text: 'Advice I give freely and have never once taken.' }],
  lanesRecord: [{ who: 'player', text: 'You are the one with the record?' }, { who: 'npc', text: 'Two hundred and twelve. Four years ago, lane two, a Tuesday, nobody in but Mott and a fox who left at the sixth frame.' },
    { who: 'npc', text: 'I have not come within thirty of it since. I do not mind. It happened.' }, { who: 'player', text: 'Do you bowl against Rook?' },
    { who: 'npc', text: 'No. Rook bowls against the pins and Gale bowls against Rook, and neither of them is having any fun at all.' },
    { who: 'npc', text: 'I come down, pick a ball, throw it badly, and go home. That is the whole sport.' }, { who: 'player', text: 'Any chance I beat 212?' },
    { who: 'npc', text: 'Every chance. It is a good number, not a great one \u2014 the great ones are up near three hundred and I am not built for those.' },
    { who: 'npc', text: 'Go on. I would rather lose it to somebody than sit on it another four years.' }],
  lanesRival: [{ who: 'player', text: 'You bowl here every week?' }, { who: 'npc', text: 'Eleven years. Same table, same ball, same fourteen pounds of it. I had it drilled before the lanes were re-laid and I have not seen a reason to change.' },
    { who: 'npc', text: 'A lane asks you the same question ten times and does not care what you did yesterday. There is not much else you can say that about.' },
    { who: 'player', text: 'Gale says you bowl the same score every time.' }, { who: 'npc', text: 'A hundred and forty-seven. Occasionally a hundred and forty-four, and once \u2014 once \u2014 a hundred and fifty-one, which unsettled me for a month.' },
    { who: 'npc', text: 'He throws for three hundred every single frame. It is magnificent to watch and he has not beaten me once in forty-one.' }] };
const DRILLS = [['7-10 SPLIT', [6, 9]], ['10 PIN', [9]], ['7 PIN', [6]], ['THE BUCKET', [1, 3, 4, 7]], ['BABY SPLIT', [2, 9]]];
export function lnCast({ lanes, save, sayTo, toast, ding, tone, hour, tenpin, tenpinOn, CHOICE_BYE }) {
  const st = (k, d) => save.stat('mln' + k, d), set = (k, v) => save.setStat('mln' + k, v);
  const find = (x, z) => (lanes && lanes.npcs || []).find(f => f && f.position && Math.abs(f.position.x - x) < 0.6 && Math.abs(f.position.z - z) < 0.6);
  const P3 = { lanesRegular: { name: 'Gale', role: 'THE REGULAR', obj: find(122.2, -32.2) }, lanesRecord: { name: 'Nera', role: 'HOUSE RECORD', obj: find(116.9, -31.3) }, lanesRival: { name: 'Rook', role: 'LEAGUE BOWLER', obj: find(120.6, -22.7) } };
  const T = k => ({ key: k, name: P3[k].name, role: P3[k].role, obj: P3[k].obj, ry: P3[k].obj ? P3[k].obj.rotation.y : 0, r: 6 });
  const L = (k, text) => ({ who: k, role: P3[k].role, text }), lines2D = k => L2D[k].map(l => (l.who === 'npc' ? L(k, l.text) : l));
  let ch = null;
  const go = (k, o, line) => { sayTo(T(k), [L(k, line)], () => { if (tenpin(o)) ch = { k, o, t: performance.now() }; }); };
  addEventListener('8g:tenpinDone', e => { const c = ch; ch = null; if (!c || c.o) return; const tot = (e.detail && e.detail.total) || 0;
    if (c.k === 'lanesRival') { if (tot > 147) { const first = !st('Rook', false); set('Rook', true); if (first) save.addGold(50); ding(); toast('YOU BEAT ROOK \u00b7 ' + tot + ' TO 147' + (first ? ' \u00b7 +50 GOLD' : ''), 3.4); setTimeout(() => sayTo(T(c.k), [L(c.k, 'A hundred and forty-eight or better. Well. That will unsettle me for a month.')]), 1600); }
      else { toast('ROOK 147 \u00b7 YOU ' + tot, 3); setTimeout(() => sayTo(T(c.k), [L(c.k, 'A hundred and forty-seven is still here. So am I. Same time next week.')]), 1600); } }
    if (c.k === 'lanesRecord') { if (tot > 212) { const first = !st('Nera', false); set('Nera', true); set('House', tot); if (first) save.addGold(100); ding(); toast('THE HOUSE IS YOURS \u00b7 ' + tot + (first ? ' \u00b7 +100 GOLD' : ''), 3.6); setTimeout(() => sayTo(T(c.k), [L(c.k, 'Two hundred and twelve is yours now. Good. I can stop counting.')]), 1600); }
      else { toast('NERA 212 \u00b7 YOU ' + tot, 3); setTimeout(() => sayTo(T(c.k), [L(c.k, tot >= 182 ? 'Within thirty. That is closer than I have been in four years.' : 'Close is not the house. Pick a ball and go again.')]), 1600); } }
    if (c.k === 'lanesRegular') { const gale = 118 + (Math.random() * 30 | 0), dash = 120 + (Math.random() * 32 | 0), us = tot + gale, them = 147 + dash, win = us > them;
      if (win) { save.addGold(30); set('LeagueW', st('LeagueW', 0) + 1); ding(); } set('LeagueN', st('LeagueN', 0) + 1);
      toast('LEAGUE NIGHT \u00b7 TEAM GALE ' + us + ' (' + tot + ' + ' + gale + ') \u00b7 TEAM ROOK ' + them + (win ? ' \u00b7 WIN \u00b7 +30 GOLD' : ''), 4.2);
      setTimeout(() => sayTo(T(c.k), [L(c.k, win ? 'Forty-two weeks. FORTY-TWO. We beat him. Do not tell him I cried.' : 'Forty-two. Same as forty-one. Next week, partner.')]), 1800); } });
  addEventListener('8g:tenpinDrill', e => { const c = ch; ch = null; if (!c || !c.o) return; const h = (e.detail && e.detail.hits) || 0, n = (e.detail && e.detail.n) || 3, key = 'Drill_' + c.o.name.replace(/[^A-Z0-9]/g, '');
    const best = st(key, 0); if (h > best) set(key, h); const perfect = h >= n && best < n; if (perfect) { save.addGold(15); ding(); }
    toast(c.o.name + ' \u00b7 ' + h + ' / ' + n + (perfect ? ' \u00b7 PERFECT \u00b7 +15 GOLD' : ''), 3.2);
    setTimeout(() => sayTo(T(c.k), [L(c.k, h >= n ? 'Every one! I have never once done that. Show me again.' : h ? 'A spare counts. That is the whole lesson.' : 'Gutters count for nothing. Ask me how I know.')]), 1400); });
  const evening = () => { const hh = hour(); return hh >= 18 && hh < 23.5; };
  const drills = () => sayTo(T('lanesRegular'), [{ ...L('lanesRegular', 'Pick a leave. Three balls. Pick it up.'), choices: [...DRILLS.map(([n, lv]) => ({ text: (st('Drill_' + n.replace(/[^A-Z0-9]/g, ''), 0) >= 3 ? '\u2713 ' : '') + n, pick: () => go('lanesRegular', { leave: lv, n: 3, name: n }, 'Lane four. ' + n + '. Do not chase it.') })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menu = k => { const ch3 = [];
    if (k === 'lanesRival') ch3.push({ text: 'YOU BOWL HERE EVERY WEEK?', pick: () => sayTo(T(k), lines2D(k)) }, { text: (st('Rook', false) ? '\u2713 ' : '') + 'BOWL AGAINST ME (BEAT 147)', pick: () => go(k, null, 'Lane four. Beat one hundred and forty-seven. Most do not.') });
    if (k === 'lanesRecord') ch3.push({ text: 'YOU ARE THE ONE WITH THE RECORD?', pick: () => sayTo(T(k), lines2D(k)) }, { text: (st('Nera', false) ? '\u2713 ' : '') + 'TAKE THE HOUSE (BEAT 212)', pick: () => go(k, null, 'Two hundred and thirteen takes it. Lane four is waiting.') });
    if (k === 'lanesRegular') ch3.push({ text: 'HOW IS IT GOING?', pick: () => sayTo(T(k), lines2D(k)) }, { text: 'LEAGUE NIGHT (TEAM GALE)', pick: () => (evening() ? go(k, null, 'You and me against Rook and Dash. Bowl your best game. I will bowl mine.') : sayTo(T(k), [L(k, 'League night starts at six. Come back then, partner.')])) },
      { text: 'SPARE DRILLS', pick: drills });
    ch3.push({ text: CHOICE_BYE, bye: true, pick: () => {} });
    const open = { lanesRival: 'Eleven years at this table.', lanesRecord: 'Nera. Two hundred and twelve, if you were wondering.', lanesRegular: 'Gale. Lane one. Forty-one weeks and counting.' }[k];
    sayTo(T(k), [{ ...L(k, open), choices: ch3 }]); };
  const near = P => { for (const k in P3) { const o = P3[k].obj; if (o && o.visible !== false && Math.hypot(P.x - o.position.x, P.z - o.position.z) < 2.2) return k; } return null; };
  return { prompt(P) { const k = near(P); return k ? 'TALK \u00b7 ' + P3[k].name.toUpperCase() : null; }, talk(P) { const k = near(P); if (!k) return false; tone(700, 0.04, 0.3, 'triangle'); menu(k); return true; },
    tick() { if (ch && performance.now() - ch.t > 2500 && !tenpinOn()) ch = null; }, P3 };
}
