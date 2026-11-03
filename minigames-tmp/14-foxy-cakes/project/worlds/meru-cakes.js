// MERU — Foxy Cakes [meruCakes]: the cake bakery, ready to wire into a world (same pattern as meru-burgers.js + meru-walkins.js).
// Miss Crumb runs it. "Put me to work!" opens the cake game in the panel (do: 'cakes'); "Bake my own" opens it in bake-your-own mode (do: 'cakesFree').
// fillCakes(K, room) drops the full bakery interior (deck oven, prep counter, turntable, cake case, café tables) into ANY walk-in building:
//   room = { X, Z, rot, w, d } in world metres (a meru-walkins.js R entry already has exactly these), +z = toward the door.
// It pushes the counters, oven and tables into K.colliders and returns the world spots for Miss Crumb, the cook and the door.
import { buildCakery, CAKES, KEEPER } from '../minigames/cake/cake-shift.js';
import { canvasTex as texFallback } from '../engine/textures.js';
import { branch } from '../engine/story.js';

export { CAKES, KEEPER };
// a walk-in footprint to add to meru-walkins.js SHOPS (art px; PLACEHOLDER position, move it to a free lot on the square)
export const SHOP = { key: 'cakes', zone: 'meruCakes', label: 'Foxy Cakes', x0: 1500, x1: 1900, y0: 1200, y1: 1560, face: 'N', h: 3.8 };
// Miss Crumb in the room's local metres (origin = room centre, +z toward the door); add to meru-walkins.js LOCAL as  missCrumb: ['cakes', x, z, face]
export const LOCAL = { missCrumb: ['cakes', -1.0, -3.1, 0.4] };
export const PEOPLE = [{ key: 'missCrumb', name: KEEPER.name, role: KEEPER.role, outfit: KEEPER.outfit, female: true, bow: true, torso: KEEPER.torso, crest: '', mood: 'happy' }];
export const DYN = {
  missCrumb: () => branch([{ who: 'npc', text: KEEPER.greeting }], [
    { label: 'Put me to work!', replies: ['Apron on, toque straight. The ticket tells you everything: recipe, frosting, the message and the toppers.'], do: 'cakes' },
    { label: 'Can I bake my own cake?', replies: ['Of course! Write anything you like in frosting. No clock, no customers, just you and the piping bag.'], do: 'cakesFree' },
    { label: 'How do I bake a cake?', replies: ['Tap the jars into the bowl, whisk it smooth, then pour it to the line in the pan.', 'Pull it from the oven when the bell rings. Frost it while the turntable spins.', 'Then trace the message in icing. A border round the edge always earns a bigger tip.'] },
    { label: 'Tell me something.', replies: [KEEPER.lines[Math.floor(Math.random() * KEEPER.lines.length)]] },
    { label: 'Maybe later.', replies: ['The oven stays warm. Come back any time.'] },
  ]),
};
// the panel pages for the two actions (open them the way the world opens minigames/meru/diner.html for do: 'diner')
export const PANEL = { cakes: 'Foxy Cakes.dc.html', cakesFree: 'Foxy Cakes.dc.html?free=1' };

export function fillCakes(K, room, { shell = false } = {}) {
  const { THREE, scene, M, toon, grad, colliders } = K, canvasTex = K.canvasTex || texFallback;
  const C = buildCakery({ THREE, M, toon, canvasTex, scene, grad, origin: { x: room.X, z: room.Z }, rotY: room.rot || 0, shell, size: { w: room.w, d: room.d } });
  C.worldBlocks().forEach(box => colliders && colliders.push({ box }));
  return { group: C.root, C, keeper: C.worldSpot('keeper'), work: C.worldSpot('work'), door: C.worldSpot('door'), seats: (C.seats || []).map(s => ({ ...C.toWorld(s.x, s.z), face: s.face + (room.rot || 0) })) };
}
