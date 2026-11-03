// GAYA — FELT'S BALL WORKS [gayaBallFactory]: the tennis ball factory as a WALK-IN INTERIOR for any world map.
// Drop-in module for the world engine (same shape as worlds/meru-burgers.js):
//   BALLWORKS            room data (size, door, spawn) in the interior's own metres
//   buildBallWorks(K, origin, opts)  builds the whole room into the world scene at `origin` (world metres), pushes
//                        colliders in the world format ({ box: [x0, x1, z0, z1] }), returns { F, people, door, spawn, exit, tick }
//   PEOPLE(origin)       Felt (foreman) for the world's NPC list, placed at his office desk
//   DYN.feltForeman      Felt's talk tree (engine/story.js branch); "Put me to work." fires do: 'ballworks'
//   GAME                 what the world passes to onPlayGame(...) to open the shift in the game panel
// The shift itself runs in the panel (Gaya Ball Factory.dc.html?embed=1), like Sizzle's diner and the casino games.
// Gold, stats and flags go through engine/save.js, so they carry back to the world (save.js now syncs across pages).
import { branch } from '../engine/story.js';
import { buildFactory, tickFactory, FACTORY, FELT, FELT_LINES } from '../minigames/gaya/ball-factory.js';

export const BALLWORKS = { key: 'ballworks', room: FACTORY.room, label: "Ball Works", w: 20, d: 14, h: 5.2,
  // interior-local metres (origin = room centre, +z = the front wall with the door)
  door: { x: 7.2, z: 7.0 }, spawn: { x: 7.2, z: 5.4 }, exitTrigger: { x: 7.2, z: 6.3, r: 0.9 }, felt: { x: -7.3, z: 2.7, face: 0.5 } };

export function buildBallWorks(K, origin = { x: 0, z: 0 }, { canvasTex } = {}) {
  const { THREE, scene, M, toon, grad, colliders, camBlockers } = K;
  const F = buildFactory({ THREE, M, toon, canvasTex: canvasTex || K.canvasTex, scene, origin, grad });
  if (colliders) F.colliders.forEach(c => colliders.push({ box: [c.x0, c.x1, c.z0, c.z1] }));
  if (camBlockers) F.front.forEach(m => camBlockers.push(m));          // the front wall hides when the camera is outside it
  F.front.forEach(m => m.visible = false); F.cut.forEach(m => m.visible = false); // trusses/lamps/signs cut away for the top-down camera
  const W = (p) => ({ x: origin.x + p.x, z: origin.z + p.z });
  return { F, door: W(BALLWORKS.door), spawn: W(BALLWORKS.spawn), exit: { ...W(BALLWORKS.exitTrigger), r: BALLWORKS.exitTrigger.r }, people: PEOPLE(origin),
    looks: F.looks.map(L => ({ x: L.p.x, z: L.p.z, name: L.name, line: L.line, exit: !!L.exit })),           // optional "Look ·" prompts
    tick: (dt, busy = false) => tickFactory(F, dt, { busy }),                                                // call every frame while inside
    setVisible(v) { F.root.visible = !!v; if (F.motes) F.motes.pts.visible = !!v; } };   // hide the whole room when the player is outside (phone budget)
}

export const PEOPLE = (origin = { x: 0, z: 0 }) => [
  { key: FELT.key, name: 'Felt', role: 'Ball Works', outfit: FELT.outfit, torso: FELT.torso, look: { fur: FELT.fur, furDark: FELT.furDark }, crest: '', mood: 'warm',
    x: origin.x + BALLWORKS.felt.x, z: origin.z + BALLWORKS.felt.z, face: BALLWORKS.felt.face } ];

export const DYN = {
  feltForeman: () => branch([{ who: 'npc', text: FELT_LINES.greet }], [
    { label: 'Put me to work.', replies: [FELT_LINES.work], do: 'ballworks' },
    { label: 'How is a ball made?', replies: [FELT_LINES.how] },
    { label: 'What does it pay?', replies: [FELT_LINES.pay] },
    { label: 'Just looking around.', replies: [FELT_LINES.bye] },
  ]),
};

// onPlayGame(GAME.key, GAME.title, GAME.url, GAME.label) — full-screen panel recommended on phones (see MERGE_GUIDE.md)
export const GAME = { key: 'ballworks', title: "Felt's Ball Works", url: 'Gaya Ball Factory.dc.html?embed=1', label: 'Ball Works', full: true };
