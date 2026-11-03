# BRAMBLE'S COMICS — merge guide

The comic book creator job + walk-around comic shop for the **Home planet** room **COMICS `[gayaLibrarySquare]`**.
It is finished and playable on its own (`Comic Shop.dc.html`). This file is everything a new chat needs to put it into a world.

---

## 1. PASTE THIS INTO THE NEW CHAT

> Read START_HERE.md, then CLAUDE.md (PROJECT_RULES.md), then BUILD_PLAN.md, then COMIC_SHOP_MERGE.md.
> Merge Bramble's Comics [gayaLibrarySquare] into the Home planet world as a fade interior off Town Square (door label "Comics").
> Use path A in COMIC_SHOP_MERGE.md (build the room with buildComicShop(ctx), open the job page with ?embed=1 from the art desk and from Bramble's "Put me to work").
> Keep the room name, Bramble's verbatim lines, the save keys and the Game HUD `shop` button key. Mobile first: check 390x844 and 844x390.

---

## 2. FILES

**New (from this chat)**

| File | What it is |
|---|---|
| `minigames/home/comic-shop.js` | Everything: `buildComicShop(ctx)` (the room), `createComicShop({ container, onState, onExit, embed })` (stand-alone game), page model + page art, all data (customers, lines, upgrades). |
| `minigames/home/comic-audio.js` | Synthesized sound effects + live shop music (Web Audio, no audio files). `comicAudio(ambience)`. |
| `Comic Shop.dc.html` | The page: welcome card, job UI, sketchbook, access panel, day card. Mounts Game HUD in walk mode. |
| `Comic Shop Phone Preview.dc.html` | 390x844 + 844x390 side by side. |
| `COMIC_SHOP_MERGE.md` | This guide. |

**Changed**

| File | Change |
|---|---|
| `Game HUD.dc.html` | Added vehicle key **`shop`** (buttons 1 WAVE · 2 LOOK · 3 JUMP; icons `shopwave`, `shoplook`, `shopjump`). Generic: use `vehicle="shop"` for any walk-in shop. Nothing else changed. |
| `BUILD_PLAN.md`, `START_HERE.md` | New sections (HOME PLANET · BRAMBLE'S COMICS, 4b). |

**Already in the project (dependencies, unchanged)**
`vendor/three/three.module.js`, `village-game.js` (rr, clamp, damp, pick, Ambience), `engine/textures.js` (canvasTex), `engine/cast.js` + `fox-kit.js` + `engine/cane.js` + `engine/chair.js` (CAST, foxes), `engine/save.js`, `engine/restaurant-kit.js` (createStage, cameraFit — it imports `meru-game.js`), `support.js`, `_ds/…`.

No images, fonts or audio files to copy. Fonts: Archivo (already in `_ds`).

---

## 3. THE ROOM

- Interior: **12.2 m square** (inner walls at ±6.1 m), wall height 3.6 m. Origin = room centre, floor at y = 0.
- **Door: south wall, centre** (x = 0, z = +6.1, 1.6 m wide). Walk-in point inside: `Y.spots.start` (0, 5.1). Step out at z > 6.3.
- Layout from the 2D art (1000-unit render × 0.016 m): bookcases on every wall, two black 8 banners (north), bunting, round 8 display + SPINNER (centre), 4 spotlights at (±2, ±2), reading tables (±4.1, 0), poster stands (±4.64, −2.5), SUPERFOX / IRON FOX standees + reel screens (±4.2, 3.15), comic bins (±4.17, 4.35), Bramble's counter (−1.6, 4.75), LOCAL ART board (2.1, 4.9), ART DESK (0, −4.5).
- Walls cut away automatically when the camera is beyond them (`Y.applyCut(cameraLocal)`), floor lamps hide when they block the view.

### `buildComicShop(ctx)` → `Y`
`ctx = { THREE, M, toon, canvasTex, scene, grad, addOutline, origin: { x, z } }` — the same ctx shape as `buildDiner` / `buildYard` (M signature `(geo, mat, x, y, z, parent, outline, radius)` from world-kit / restaurant-kit).

| `Y.` | Use |
|---|---|
| `root` | The room group (positioned at `origin`). |
| `colliders` | Boxes `{ x0, x1, z0, z1 }` in **room-local** metres. Add `origin` for world space. |
| `circles` | Round blockers `{ x, z, r }` (room-local). |
| `RW` | 6.1 (half size). Keep the walker inside ±(RW − 0.62); door gap at \|x\| < 0.62. |
| `interact` | `{ id, x, z, r, label }`: `bramble`, `desk`, `spinner`, `superfox`, `ironfox`, `posterL`, `posterR`, `tableL`, `tableR`, `door`, `gallery`. |
| `spots` | `start`, `door`, `bramble` (−2.42, 4.85, face +x), `seat`, `wait`, `react`, `aisle`. |
| `update(dt, t)` | Hero reels + spinner. Call every frame while the player is inside. |
| `applyCut(camLocal)` | Hide the wall the camera is behind. `camLocal = camera.position − root.position`. |
| `board`, `pageMesh`, `tilt` | The drafting board (the job draws its page here). |
| `frames`, `spinCovers` | LOCAL ART frames + spinner covers (the stand-alone game fills them from the gallery). |
| `spin` | `Y.spin.v += 7` spins the spinner. |

Exports for the world's own NPC + talk code: `BRAMBLE` (look + **verbatim** greeting / `best` lines; `job` lines are new), `PIZZA_LINES` (verbatim delivery-stop lines), `LOOKS`, `READS`, `CUSTOMERS`, `COMICS` (`room: 'gayaLibrarySquare'`).

---

## 4. MERGE PATH A (recommended): room in the world, job as a full-screen panel

The world owns walking; the job runs in its own page inside a panel (like the Meru casino / original minigame panels). Save is shared, so gold, the uniform and upgrades carry over.

```js
import { buildComicShop, BRAMBLE, PIZZA_LINES, LOOKS, COMICS } from './minigames/home/comic-shop.js';

// 1. build the interior far from the map, like the other fade interiors
const SHOP = buildComicShop({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin: { x: 900, z: 900 } });

// 2. colliders → the world walker (room-local + origin)
SHOP.colliders.forEach(b => walker.addBox(b.x0 + 900, b.x1 + 900, b.z0 + 900, b.z1 + 900));
SHOP.circles.forEach(c => walker.addCircle(c.x + 900, c.z + 900, c.r));

// 3. every frame while inside
SHOP.update(dt, t);
SHOP.applyCut(camera.position.clone().sub(SHOP.root.position));

// 4. Bramble: fox-kit fox with BRAMBLE colours at SHOP.spots.bramble, facing +x.
//    Talk tree: greeting → "What's the best thing in here?" (BRAMBLE.best, verbatim) / "Got any work for me?" (BRAMBLE.job) → "Put me to work." → openJob()
// 5. interact ids: desk → openJob(); spinner → SHOP.spin.v += 7; others → toast(LOOKS[id]); door → fade back to gayaTownSquare.

function openJob() {
  openPanel('Comic Shop.dc.html?embed=1');            // full-screen iframe, same origin
}
window.addEventListener('message', e => {
  if (e.data && e.data.type === '8gates:comic-shop' && e.data.action === 'exit') closePanel();   // TAKE A BREAK / BACK TO THE SHOP
});
```

`?embed=1` does this: no Game HUD (the world has its own), LOOK AROUND becomes **BACK TO THE SHOP**, TAKE A BREAK leaves too. Both post `{ type: '8gates:comic-shop', action: 'exit', from: 'gayaLibrarySquare', reason: 'break', gold }` to the parent.

Optional shop music while walking in the room (same synth as the job page):
```js
import { comicAudio } from './minigames/home/comic-audio.js';
const SHOP_SND = comicAudio(worldAmbience);   // the world's Ambience (village-game.js)
// on entering: SHOP_SND.ensure(); SHOP_SND.setMusic('shop');   on leaving: SHOP_SND.setMusic(null);
```
(`comicAudio` turns the Ambience's outdoor wind down while it is in use — turn it back up on leaving: `worldAmbience.wind.gain.value = 0.1`.)

## 5. MERGE PATH B (later): job inside the world scene
`createComicShop` builds its own renderer. To run the job in the world's scene, lift the job half of `createComicShop` (page model, gestures, camera on `SHOP.board`) into the world module and point it at the world's camera — only worth it if the panel switch feels slow on phones.

---

## 6. SAVE + SETTINGS (all shared, `engine/save.js` = `8gates.save.v1`)
- Gold: `save.addGold`, upgrades: stats `home.comics.upg.<id>` (lightbox, nib, ruler, stamp, radio), day `home.comics.day`, best day `home.comics.best`, employee stars `home.comics.stars`.
- Flag **`comicsUniform`** (beret + 8 COMICS apron, after the first day).
- Per device (localStorage, not the save): `home.comics.opts` (voice, hc, easy, music, sfx, haptics) and `home.comics.gallery` (last 8 pages/sketches as small JPEGs for the LOCAL ART board + spinner).

## 7. WHAT'S IN THE GAME (for reference)
Walk mode (Game HUD `vehicle="shop"`, tap-to-walk, Bramble talk, spinner that bites, browsing foxes, Sal's pizza delivery) · commissions from the Home planet townsfolk · tasks PANELS / PENCIL / INK / FACE / COLOUR / SFX / LETTER / TITLE / SIGN, all gestures on the page, pinch zoom · series SUPERFOX, IRON FOX, PIZZA PATROL, HOPE · THE SNOW KING villain · STARRING customers · streaks + shake + particles · events (COMIC DAY every 5th day, SIGNING DAY every 3rd) · SKETCHBOOK + LOCAL ART board · access (voice, high-contrast patterns, easy timing) · synthesized SFX + live jazz trio music (modes shop / work / rush / sketch / react, ducking, haptics) · demo (`?demo=1`).

## 8. CHECK AFTER MERGING
- [ ] Walk in from Town Square, walls cut away, Bramble greets with his verbatim lines.
- [ ] Art desk + "Put me to work" open the job; TAKE A BREAK / BACK TO THE SHOP return to the room in the same spot.
- [ ] Gold earned in the job shows in the world HUD (shared save).
- [ ] 390x844 + 844x390 on a real phone: pencil dots, ink hold, pinch zoom, music + sounds after the first tap.
- [ ] Update BUILD_PLAN.md.
