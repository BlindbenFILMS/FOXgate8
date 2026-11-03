# 8 GATES 3D: minigame brief (attach this to every new minigame project)

You are building ONE minigame for **8 GATES 3D**, a toon-shaded three.js game with fox characters. The game must work in two ways:
1. **On its own**, as a full-screen page (that is how you test it in this project).
2. **Inside the 8 GATES world.** Later, the world loads your module, and you play on a table, court or machine that is already standing in the 3D town: no new page and no loading screen. Your code must allow this from day one (see WORLD MODE).

The line at the top of the prompt says which game to build (for example "basketball on a court with 2 teams"). Everything else is in this file. Build it fully: rules, AI opponents, animations, sound, UI, mobile controls. Do not stop at a prototype.

---

## 1. Files to deliver (one folder, no build step)

```
<game>/
  <Game Name>.dc.html          the page (Design Component): UI only, loads the module below
  minigames/<game>/<game>.js   the game module: scene, rules, camera, input (ES module)
  minigames/<game>/<game>-rules.js   pure rules + AI (no three.js), optional
  minigames/<game>/<game>-audio.js   WebAudio synth sound + music, optional
  vendor/three/three.module.js  three.js r160 (vendored copy, ESM)
  README.md                    what it is, controls, the API, "TRY THIS" checklist
```
- Plain ES modules, no npm, no bundler, no TypeScript. Imports are relative: `import * as THREE from '../../vendor/three/three.module.js';` (the world has the same path, so the file drops in unchanged).
- Use only three.js. No other 3D or physics libraries; write the small physics you need yourself.
- Keep every file under ~120 KB. Phone budget: no shadow maps on touch devices, few lights, merged static meshes, under ~150 draw calls.

## 2. The module API (exact shape)

```js
export const GAME = { key: 'basketballCourt', name: 'BASKETBALL', maxPlayers: 4 };
export async function createBasketball({ container, onState = () => {}, opts = {} }) {
  // ... build, start loop ...
  return {
    hud(),                // current state object (same thing onState sends)
    setSafe({ top, bottom, left, right }),   // px the page UI covers; re-fit the camera so the action sits in the free area
    start(mode),          // 'cpu' | 'local' (pass & play) | 'demo' ... whatever your game has
    key(e),               // the world forwards keydown events here in world mode
    get camera(),         // in world mode: the WORLD-SPACE camera (see 4), else the normal camera
    snapCam(),            // jump the camera to its goal now (no glide)
    destroy(),            // stop everything, remove listeners; in world mode remove ONLY your group
    // + every button action the page needs (pass, shoot, restart, menu, ...)
  };
}
```
- `onState(h)` is called about 10 times a second, plus at once on any change, with a plain object the page renders from: phase, score, timer, whose turn, messages, the result card, and so on. Nothing in the page reads three.js.
- The page never reaches into the scene; it only calls API methods.

## 3. Standalone mode (the default)
- Make your own `WebGLRenderer` inside `container`, plus your own scene, lights and room or court around the play area, then render every frame with `requestAnimationFrame`.
- Resize with a `ResizeObserver` on the container.
- Pointer input goes on `renderer.domElement`.

## 4. WORLD MODE (required): `opts.world = { renderer, camera, parent }`
The world passes in its own renderer, its own camera (read `.fov` only) and a `parent` Group placed where your play area stands in town. When `opts.world` is set:
- **No renderer of your own**, and never call `renderer.render`, `setSize` or `dispose`. The world renders.
- **Your scene is a Group**: `scene = new THREE.Group(); opts.world.parent.add(scene);`. Every game object goes into that group, in the same local coordinates as standalone mode (origin = centre of your play area, y = 0 = the ground, +z = the player's side).
- **Lights, sky, room walls, floor, fog and background go into a throw-away `new THREE.Scene()`**, never into the group, so the town's lighting stays untouched. Build the playable object (table, court lines, hoops, net) into the group, and only that. Put it behind a flag so standalone mode still gets the full room.
- **Camera**: keep your own `PerspectiveCamera` in local space, with its fov = `opts.world.camera.fov`. Every frame after you aim it, mirror it into world space and expose that as `api.camera`:
  ```js
  camera.updateMatrixWorld(); scene.updateWorldMatrix(true, false);
  wcam.position.copy(camera.position); scene.localToWorld(wcam.position);
  scene.getWorldQuaternion(q); wcam.quaternion.copy(q).multiply(camera.quaternion);
  wcam.fov = camera.fov; wcam.aspect = camera.aspect; wcam.updateProjectionMatrix(); wcam.updateMatrixWorld();
  ```
  The world glides its camera onto `api.camera`.
- **Size**: read the width and height from `opts.world.renderer.domElement.clientWidth/clientHeight`, and set `camera.aspect` from them every frame.
- **Input**: listen for `pointerdown` on `window` in CAPTURE mode, act only when `e.target === renderer.domElement`, then call `e.preventDefault(); e.stopImmediatePropagation()` (so the town does not also react). Raycast with your LOCAL camera (call `camera.updateMatrixWorld()` first). Keys arrive through `api.key(e)`; do not add your own window keydown listener in world mode.
- **Music off** by default in world mode (the town has its own music). Sound effects stay on.
- **destroy()** in world mode: cancel the animation frame, remove listeners, `parent.remove(scene)`, close your AudioContext. Do not dispose the world's renderer.
- Never add objects to anything outside your group. Never change the world camera yourself.

## 5. The page (`<Game Name>.dc.html`)
- UI only. On mount it imports the module and calls `create...({ container: stageDiv, onState })`.
- **OVERLAY MODE**: when the page is given a prop `world` (the world's walker object), it must NOT create the game. It listens for `window` events `8g:<gameKey>` (detail = the hud object, or null when the game closes), gets the game API from `world._<gameKey>.g()`, and calls `world._<gameKey>.end()` for BACK. In overlay mode the root has a transparent background and `pointer-events: none`, panels and buttons have `pointer-events: auto`, and the empty middle passes taps through to the 3D canvas.
- **Three buttons always on screen while playing**: `MENU` (options card: rules, restart, difficulty, sound, leave) · `INVITE FRIEND` (online room + share link, or a "coming soon" card if you have no online play) · `BACK` (red, leave). No start/option card before play: the game starts at once with sensible defaults, and the options live under MENU.
- Mark every UI block that covers the screen with `data-safe="top|bottom|left|right"`, measure them, and call `api.setSafe(...)` so the camera frames the action in the free area.

## 6. Look and UI (Modernist)
- UI: Archivo font, black panels, 2px rules (`#3a3836` on black), red accent `#ec3013`, yellow highlight `#ffd23a`, white text. Square corners everywhere (no border-radius), labels flush left (even inside buttons), no gradients, no emoji.
- 3D: toon shading (`MeshToonMaterial` with a 3-step gradient map) plus ink outlines (a back-face shell mesh in `#1a1626`). Bright, chunky, readable shapes.
- **Foxes**: characters are anthropomorphic foxes. The world will hand you its fox maker as `opts.kit` (`kit.makeFox({ torso:[c1,c2,c3], outfit:'vest'|'coat'|'dress'|'tee', mood }) → Group`, about 2.8 units tall, with `userData.P` holding body / head / arms[2] / legs[2] for posing; `kit.animFox(fox, dt, speed)` walks or idles it). Write a SMALL ADAPTER (`makeFox(opts)`) that uses `opts.kit` when present and otherwise your own simple placeholder fox (capsule body, head with ears and snout, two arms, two legs, the same joints). Pose your players through that adapter only.
- Cast for opponents: PIP (rookie, yellow), HOPE (club level, blue legs, sunglasses, a white cane, plays by feel), NOBLE (master, uses a futuristic chair; red eyes). Easy, medium and hard map to them.

## 7. Mobile first (top priority)
- Test at 390x844 (portrait) and 844x390 (landscape) before anything else.
- Touch targets are 44px or more. Use one-thumb controls where possible: tap, drag, or a hold-and-release power meter. If it needs movement, a left joystick plus 1 / 2 / 3 buttons on the right.
- Show a hint hand after 3 seconds of no input. Text never below 12px, and dialogue boxes 20 words or fewer.
- The camera is fitted from points (the play area plus the players) to the free screen area, re-fitted on resize and on setSafe, with a wider lens in portrait.

## 8. Rules for every game
- **Max 4 players** (people or AI). Modes: VS CPU (3 levels), PASS & PLAY, DEMO (two AI foxes play while captions teach). Online is optional.
- Rewards: gold and XP on a win, a best score, stars. Save through `opts.save` when given (`save.addGold(n)`, `save.stat(key, def)`, `save.setStat(key, v)`); otherwise use localStorage under `<gameKey>.*`.
- Results card: score, best, gold won, PLAY AGAIN, BACK.
- Short readable sound effects made with WebAudio synth, no audio files.
- Any renderer that snapshots a single frame (portraits, thumbnails) must set `renderer.fastStart = false`.
- Never end a one-line code snippet with a `//` comment (it can swallow the rest of the line when merged); use `/* */`.

## 9. Before you finish
- Standalone page works on desktop, 390x844 and 844x390, with no console errors.
- A **world-mode test page** (`World Test.dc.html`) proves WORLD MODE works: it makes its own renderer and a simple "town" scene (ground plane, sky colour, a light), adds a parent Group at an offset with a rotation (for example position (20, 0, -15), rotation.y = 0.9), calls `create...({ opts: { world: { renderer, camera: townCam, parent } } })`, renders the town scene with a camera that copies `api.camera` every frame, and mounts the page in overlay mode with a fake `world` object. Play a full game there.
- README: controls, modes, the full API, the `8g:<gameKey>` event, and a TRY THIS checklist.
- Hand over the whole folder (download as zip).
