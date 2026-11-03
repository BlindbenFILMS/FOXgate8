// s652 MERU NEWS stories (tiny: no three.js). The load screen reads this directly so the video starts at once; engine/news-cast.js re-exports it.
// BEN WRITES THE HEADLINES. 'planets' text is his; lines[] after the headline = PROPOSAL (s648), waiting for Ben's OK.
export const NEWS = [
  { id: 'planets', kicker: 'BREAKING', text: 'NEW PLANETS DISCOVERED, all four with sources of raw crystal, King Might is hopeful colonies will thrive.',
    lines: ['Good evening, Meru. I\u2019m Sterling Gloss, and this is Meru News.',
      'New planets discovered, all four with sources of raw crystal. King Might is hopeful colonies will thrive.',
      'Survey crews report open land, fresh water, and crystal seams close to the surface on every one of the four worlds.',
      'This afternoon the first scout ship lifted off from the frontier pad, with a cargo ship close behind, loaded with tools, seed and supplies.',
      'The King asks every pilot to fly safe, and to report anything strange out past the docks.',
      'Families thinking of making the move can ask at the castle. More on the new worlds as the crews report back.',
      'That\u2019s Meru News. Stay bright, Meru.'] },
];
const readSave = () => { try { return JSON.parse(localStorage.getItem('8gates.save.v1') || '{}') || {}; } catch (e) { return {}; } };
const isOn = (w, S) => { if (!w) return true; let v = true; if (w.flag) v = !!(S.flags && S.flags[w.flag]); else if (w.stat) v = !!(S.stats && S.stats[w.stat]); return w.not ? !v : v; };
export function pickNews() { const S = readSave(), L = NEWS.filter(n => isOn(n.when, S)).reverse(); return L.length ? L : [NEWS[0]]; }
