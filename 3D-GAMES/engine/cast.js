// THE CAST: the one place the player, Hope and Noble are defined. Every map, arena and workshop builds them from here,
// so a change saved in a workshop shows up everywhere.
//   player: Fox Workshop look (PLAYER_MALE in fox-kit.js) in the 8-crest armour
//   hope:   HOPE_LOOK + armour, white bow, sunglasses, blue legs + her long cane (Cane Workshop → presets/cane.json)
//   noble:  PLAYER_MALE + armour, red eyes, blue legs, in his chair (Noble Workshop → presets/chair.json); shoemerang = right boot
import { PLAYER_MALE, HOPE_LOOK } from '../fox-kit.js';
import { caneKit, loadCane, CANE_DEFAULTS } from './cane.js';
import { chairKit, loadChair, CHAIR_DEFAULTS } from './chair.js';
const ARMOUR = ['#ffffff', '#e7edf4', '#6b7d93'];
export const CAST = {
  player: { key: 'player', name: 'BEN', torso: ARMOUR, crest: '8', look: PLAYER_MALE, outfit: 'armor', gear: 'both', eyes: ['#38bdf8', '#38bdf8'], mood: 'determined' },
  hope: { key: 'hope', torso: ARMOUR, crest: '8', bow: true, glasses: 'sun', legColor: '#38bdf8', outfit: 'armor', look: HOPE_LOOK, eyes: ['#f472b6', '#2dd4bf'], mood: 'happy' },
  noble: { key: 'noble', torso: ARMOUR, crest: '8', chair: true, legColor: '#38bdf8', outfit: 'armor', look: PLAYER_MALE, eyes: ['#dc2626', '#dc2626'], mood: 'determined' },
};
export const NOBLE_SHOE_FOOT = 0;   // legs[0], his right boot, is always the one that comes off
export async function loadCastRigs() { const [cane, chair] = await Promise.all([loadCane(), loadChair()]); return { cane, chair }; }
// castKit({ THREE, M, toon, makeFox }, rigs) → make('player' | 'hope' | 'noble', overrides)
// The returned fox carries userData.rig, which animFox updates every frame.
export function castKit({ THREE, M, toon, makeFox }, rigs = {}) {
  const CK = caneKit({ THREE, M, toon }), HK = chairKit({ THREE, M, toon });
  function make(key, o = {}) {
    const f = makeFox({ ...CAST[key], ...o });
    if (key === 'hope') f.userData.rig = CK.attach(f, rigs.cane || CANE_DEFAULTS);
    if (key === 'noble') f.userData.rig = HK.attach(f, rigs.chair || CHAIR_DEFAULTS);
    return f;
  }
  return { make, CAST };
}
