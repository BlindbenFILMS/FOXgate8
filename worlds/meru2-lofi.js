// s655 MERU MUSIC V2 (Ben: "mirror the space map with lofi sections and battle music for meru").
// One lofi song per Meru zone on the space map's engine (engine/space-lofi.js): same 78 BPM + 8-bar grid, so zones crossfade (~5 s)
// without clashing, and the battle song (RED ALERT / UNDER ATTACK / ADVENTURE) slides in over them when foes come for you.
// Each zone: its own key + 4 chords, lead, chord style, drum feel, texture, swing; melodies are seeded (same notes every visit).
// Music V1 (the s150l zone songs + Arena party + battle-music.js) is saved in music/v1/ and still plays with ?music=1
// or localStorage meru.music.version = 1.
const Q = { maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14], d9: [0, 4, 7, 10, 14], m11: [0, 3, 7, 10, 17], sus: [0, 5, 7, 10, 14], lyd: [0, 4, 7, 11, 18], m7: [0, 3, 7, 10, 15], maj7: [0, 4, 7, 11, 16] };
const C = (r, q) => ({ root: r, v: Q[q].map(i => r + 12 + i) });
const T = (title, ch, lead, keys, drums, tex, sw, seed, rh) => ({ title, ch, lead, keys, drums, tex, sw, seed, rh });
export const MERU_LOFI = {
  mz_town:       T('TOWN SQUARE',      [C(41, 'maj9'), C(38, 'm9'), C(43, 'm9'), C(36, 'd9')],   'kalimba', 'rhodes', 'boom',    'lantern', 0.2,  101, 'mid'),
  mz_market:     T('MARKET DAY',       [C(38, 'd9'), C(36, 'maj9'), C(43, 'maj9'), C(38, 'sus')], 'marimba', 'stab',   'shuffle', 'sparkle', 0.24, 103, 'busy'),
  mz_court:      T('THE COURT',        [C(40, 'm9'), C(45, 'd9'), C(40, 'm11'), C(47, 'm7')],    'vibe',    'rhodes', 'shuffle', 'chime',   0.26, 107, 'mid'),
  mz_civic:      T('CIVIC HALL',       [C(46, 'maj9'), C(39, 'maj9'), C(41, 'sus'), C(43, 'm9')], 'horn',    'pad',    'half',    'echoes',  0.14, 109, 'sparse'),
  mz_gardens:    T('ROYAL GARDENS',    [C(43, 'lyd'), C(45, 'd9'), C(43, 'lyd'), C(40, 'm9')],   'harp',    'arp',    'half',    'chime',   0.16, 113, 'sparse'),
  mz_castlepath: T('CASTLE ROAD',      [C(38, 'm9'), C(46, 'maj9'), C(41, 'maj9'), C(36, 'd9')], 'flute',   'pad',    'boom',    'wind',    0.18, 127, 'mid'),
  mz_barracks:   T('BARRACKS',         [C(36, 'm9'), C(44, 'maj9'), C(46, 'd9'), C(43, 'm7')],   'horn',    'stab',   'bounce',  'embers',  0.12, 131, 'mid'),
  mz_skate:      T('SKATE BOWL',       [C(45, 'm9'), C(41, 'maj9'), C(38, 'm9'), C(40, 'd9')],   'steel',   'stab',   'bounce',  'sparkle', 0.24, 137, 'busy'),
  mz_ruinspath:  T('RUINS ROAD',       [C(40, 'm7'), C(41, 'maj7'), C(40, 'm7'), C(38, 'm9')],   'oud',     'pad',    'tabla',   'sand',    0.16, 139, 'sparse'),
  mz_ruins:      T('OLD RUINS',        [C(35, 'm7'), C(36, 'maj9'), C(35, 'm11'), C(45, 'm9')],  'bell',    'choir',  'half',    'echoes',  0.1,  149, 'sparse'),
  mz_lakepath:   T('LAKE ROAD',        [C(45, 'maj9'), C(42, 'm9'), C(38, 'maj9'), C(40, 'sus')], 'whistle', 'rhodes', 'boom',    'waves',   0.2,  151, 'mid'),
  mz_lake:       T('MERU LAKE',        [C(39, 'maj9'), C(36, 'm9'), C(44, 'maj9'), C(46, 'sus')], 'bell',    'pad',    'half',    'waves',   0.14, 157, 'sparse'),
  mz_island:     T('ISLAND HOP',       [C(36, 'maj9'), C(45, 'm9'), C(41, 'maj9'), C(43, 'd9')], 'steel',   'stab',   'reggae',  'waves',   0.2,  163, 'busy'),
  mz_falls:      T('THE FALLS',        [C(41, 'lyd'), C(43, 'd9'), C(45, 'm9'), C(46, 'maj9')],  'harp',    'pad',    'half',    'wind',    0.12, 167, 'sparse'),
  mz_ridge:      T('HIGH RIDGE',       [C(38, 'm11'), C(43, 'd9'), C(38, 'm11'), C(36, 'd9')],   'flute',   'choir',  'half',    'wind',    0.16, 173, 'mid'),
  mz_castle:     T("KING MIGHT'S HALL", [C(39, 'maj9'), C(46, 'd9'), C(36, 'm9'), C(44, 'maj9')], 'horn',    'choir',  'epic',    'lantern', 0.1,  179, 'mid'),
  mz_park:       T('FUN PARK',         [C(43, 'maj9'), C(40, 'm9'), C(36, 'maj9'), C(38, 'd9')], 'marimba', 'arp',    'bounce',  'sparkle', 0.22, 181, 'busy'),
  mz_arena:      T('ARENA LIGHTS',     [C(45, 'm9'), C(43, 'd9'), C(41, 'maj9'), C(40, 'd9')],   'vibe',    'stab',   'bounce',  'embers',  0.18, 191, 'busy'),
};
// a zone's music key → its lofi song (anything unknown plays the town song)
export const lofiKey = k => !k ? null : /arena/i.test(k) ? 'mz_arena' : MERU_LOFI['mz_' + k] ? 'mz_' + k : 'mz_town';
export const musicVersion = () => { const q = location.search.match(/[?&]music=(\d)/); if (q) return q[1] === '1' ? 1 : 2; try { return localStorage.getItem('meru.music.version') === '1' ? 1 : 2; } catch (e) { return 2; } };
