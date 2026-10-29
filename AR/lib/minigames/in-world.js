// PLAY A PAINTING'S GAME INSIDE A 3D WORLD (the 8 GATES 3D gallery, or any three.js scene).
// The painting games were made for the AR page, where the game sits on the real painting. Here the game sits on the
// painting's frame in the 3D room instead: same game, same sounds and voice, same screen HUD.
//
//   import { playOnPainting } from '../../AR/lib/minigames/in-world.js';
//   import { seeItMyWayGame } from '../../AR/lib/minigames/walk-through-fear-see.js';   // Walk Through Fear's game
//   const play = playOnPainting({
//     make: seeItMyWayGame,                         // the painting's game (each painting's is listed in ./index.js, SPECIAL)
//     scene, camera, renderer,                      // the world's
//     center: new THREE.Vector3(x, y, z),           // middle of the painting's picture, in world units
//     normal: new THREE.Vector3(0, 0, 1),           // the way the painting faces (out of the wall, toward the viewer)
//     width: 2, height: 2,                          // the picture's size in world units
//     work: { id, title, artist, quote, image, overlay: { anim } },   // from AR/artworks.js (image/anim as full URLs)
//     say: text => speechSynthesis.speak(new SpeechSynthesisUtterance(text)),   // the computer voice, for anything Ben didn't record
//     buzz: p => navigator.vibrate && navigator.vibrate(p),
//     story: () => window.open(storyUrl, '_blank'), // the "Ben's story" button at the end
//     onEnd: () => {},                              // called once when the game is over (the end panel is showing)
//   });
//   each frame:            play.update(dt)        (dt in seconds)
//   leaving / Esc:         play.stop()            (removes the game, its HUD and its sounds)
//   play.over              true once the end panel shows (or, for Napkin Please, once the avalanche happens)
//   play again:            play.restart()
//
// While the game is on: put the camera square in front of the painting (the middle of the screen is where the player
// "looks": several games, like See it my way, follow it), stop the avatar walking on drag, and hide the world's own HUD
// along the top and bottom (the game's HUD is fixed to the screen: a panel at the top, big buttons near the bottom).
import * as THREE from 'three';

export function playOnPainting(o) {
  const make = o.make; if (!make) throw new Error('playOnPainting needs make: the painting’s game');
  // the game's board: a group whose x runs across the picture (1 unit = the picture's width), y up, facing +z
  const group = new THREE.Group();
  const n = o.normal.clone().normalize(), up = Math.abs(n.y) > 0.99 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(up, n).normalize(), y = new THREE.Vector3().crossVectors(n, x);
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, n));
  group.position.copy(o.center).addScaledVector(n, o.lift ?? 0.004 * o.width);   // a hair in front of the picture
  group.scale.setScalar(o.width);
  o.scene.add(group);
  let game = make(), ended = false, live = true;
  const ctx = { group, h: o.height / o.width, camera: o.camera, renderer: o.renderer, work: o.work, say: o.say || (() => {}), buzz: o.buzz || (() => {}), story: o.story || (() => {}) };
  game.start(ctx);
  const el = o.renderer.domElement, on = k => ev => { if (live) game.pointer(k, ev); };
  const hs = { down: on('down'), move: on('move'), up: on('up') };
  for (const k in hs) el.addEventListener('pointer' + k, hs[k]);
  return {
    get game() { return game; }, group,
    update(dt) { if (!live) return; game.update(dt); if (!ended && game.over) { ended = true; o.onEnd && o.onEnd(); } },
    pause() { game.pause && game.pause(); }, resume() { game.resume && game.resume(); },
    restart() { if (!live) return; try { game.stop(); } catch (e) {} game = make(); ended = false; game.start(ctx); },   // Play again, on the same painting
    stop() { if (!live) return; live = false; for (const k in hs) el.removeEventListener('pointer' + k, hs[k]); try { game.stop(); } catch (e) {} o.scene.remove(group); },
    get over() { return !!game.over; },
  };
}
