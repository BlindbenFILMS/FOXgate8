// THE CAST: the one place the player, Hope and Noble are defined. Every map, arena and workshop builds them from here,
// so a change saved in a workshop shows up everywhere.
//   player: Fox Workshop look (PLAYER_MALE in fox-kit.js) in the 8-crest armour
//   hope:   HOPE_LOOK + armour, white bow, sunglasses, blue legs + her long cane (Cane Workshop → presets/cane.json)
//   noble:  PLAYER_MALE + armour, red eyes, blue legs, in his chair (Noble Workshop → presets/chair.json); shoemerang = right boot
import { PLAYER_MALE, HOPE_LOOK } from '../fox-kit.js?v=s673';
import { caneKit, loadCane, CANE_DEFAULTS } from './cane.js';
import { chairKit, loadChair, CHAIR_DEFAULTS } from './chair.js';
import { fighterGear } from './fighter-gear.js?v=s340c';   // s186 Fox Fighters: sword on the back, laser in a hip holster
const ARMOUR = ['#ffffff', '#e7edf4', '#6b7d93'];
// s681 PRINCE MAX (Ben): King Might's son, the player's cousin, BLIND: royal dark glasses (gold frame), the SAME white cane as Hope (sized to him), light royal armour
// in Meru navy + gold with his M crest, a thin gold circlet. Fur + ears from his 2D face (orange, navy ears, deep red inner).
export const MAX_LOOK = { ...PLAYER_MALE, fur: '#ea580c', furDark: '#c2410c', paw: '#ea580c', tailMid: '#ea580c', tailBase: '#c2410c' /* s717 hands + tail = fur */, muzzle: '#fdba74', snout: '#f9a96a', ear: '#0f172a', earInner: '#7f1d1d', leg: '#22304f', boot: '#0e1730', armorAccent: '#e6b45a', hat: 'circlet', hatBand: '#2b4fd0' };
export const CAST = {
  player: { key: 'player', name: 'BEN', torso: ARMOUR, crest: '8', look: PLAYER_MALE, outfit: 'armor', gear: 'both', eyes: ['#38bdf8', '#38bdf8'], mood: 'determined' },
  hope: { key: 'hope', torso: ARMOUR, crest: '8', bow: true, glasses: 'sun', legColor: '#38bdf8', outfit: 'armor', look: HOPE_LOOK, eyes: ['#f472b6', '#2dd4bf'], mood: 'happy' },
  max: { key: 'max', name: 'PRINCE MAX', torso: ['#2b3f78', '#3a4a75', '#e6b45a'], crest: 'M', glasses: 'royal', legColor: '#22304f', outfit: 'armor', look: MAX_LOOK, eyes: ['#0f172a', '#0f172a'], mood: 'warm' },
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
    if (key === 'hope') f.userData.gait = 'light';   // s665 her own lighter, bouncier step (fox-kit legTick)
    if (key === 'max') { f.userData.gait = 'light'; f.userData.rig = CK.attach(f, { ...(rigs.cane || CANE_DEFAULTS) }); }   /* s681 Max: the same white cane as Hope */
    if (key === 'hope') f.userData.rig = CK.attach(f, { ...(rigs.cane || CANE_DEFAULTS), ...(o.caneArm != null ? { arm: o.caneArm } : {}) });   // s91: o.caneArm = which hand holds the cane
    if (key === 'noble') f.userData.rig = HK.attach(f, rigs.chair || CHAIR_DEFAULTS);
    if (o.holster && key === 'player') fighterGear({ THREE, M, toon }, f, o.holster === true ? {} : o.holster);   // s186: opt-in (the walk-around world); battle maps keep the sword + laser in hand
    return f;
  }
  return { make, CAST };
}
