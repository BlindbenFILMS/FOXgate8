# The 70 painting games: handed over to the 3D gallery

**For:** the Claude chat that runs Ben's 3D gallery (`8GATES-SITE/3D`).
**From:** the Claude chat that made the 70 Blind Canvas painting games.
**Date:** 12 November 2026.
**Answers:** `how-to-hand-over-the-70-games.md`.
**Built on:** the live site at commit `20a6fee` (“fable”). I compared Ben's folder with it at 9:35 pm that day: all 128 files in `AR/lib/minigames` and the pages in `AR` were the same size as on the live site, and neither new file was there yet.

## In short

- `AR/lib/minigames/gallery-games.json` has one entry for each of the 70 paintings, in the shape you asked for.
- The zip holds 25 files: 2 new and 23 changed. Nothing is outside `AR`, and there is no `3D` folder.
- Every game, picture, sound and voice line is already on the live site. So the zip holds only what had to change, and no media at all.
- Ten games would have opened in the gallery with their pictures missing. That is fixed (section 2).
- Two shared files changed a little, `kit.js` and `voice.js` (section 3). Those changes reach the AR page too, and were tested there.
- A robot played all 70 games to the end in `AR/world-test.html`, loaded the way the gallery loads them, on a phone-sized upright screen. All 70 loaded with no file missing, played to the end, showed their end panel, played again, and left nothing behind when closed.
- `painting-media-for-games.md` never reached me. I took the keys from the gallery's own data and checked every one against the gallery's own picture (section 4). Please check them against your table.
- Section 5 lists what is unfinished and what is yours to decide.

## 1. Every file in the zip

The zip unpacks as `8GATES-SITE/AR/...`. Sizes are in bytes. “Was” is the file on the live site at `20a6fee`.

**Before you replace a changed file in Ben's folder, check that his copy is still the “was” size.** If it isn't, someone has edited it since, and the two versions need merging.

| File | | Was | Now | What |
|---|---|---|---|---|
| `AR/GAMES_HANDOFF.md` | new |  | (this note) | This note. |
| `AR/README.md` | changed | 48,975 | 50,405 | One new section at the end, “The games in the 3D gallery”. Nothing else changed. |
| `AR/lib/minigames/beauty-dance.js` | changed | 24,235 | 24,334 | Dance in the flowers. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/cane-beat.js` | changed | 27,571 | 27,608 | Cane beat. Its spare address for the painting’s picture now starts from the game’s own file (section 2). |
| `AR/lib/minigames/coaster-track.js` | changed | 26,476 | 26,513 | Pick your track. Its spare address for the painting’s picture now starts from the game’s own file (section 2). |
| `AR/lib/minigames/communion-bridge.js` | changed | 26,599 | 26,698 | Calm the crossing. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/fearless-dance.js` | changed | 41,731 | 41,830 | Robot dance party. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/gallery-games.json` | new |  | 43,031 | The list the gallery reads: one entry for each of the 70 paintings. |
| `AR/lib/minigames/hair-still.js` | changed | 22,955 | 22,992 | Still me. Its spare address for the painting’s picture now starts from the game’s own file (section 2). |
| `AR/lib/minigames/harley-ride.js` | changed | 30,295 | 30,394 | Ride by feel. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/haute-style.js` | changed | 32,461 | 32,597 | Style the dream. Its pictures now load from the game’s own file and its spare address for the painting’s picture now starts from the game’s own file (section 2). |
| `AR/lib/minigames/hnw-flight.js` | changed | 13,309 | 13,471 | First flight. The butterfly stays hidden until its picture has loaded (section 2). |
| `AR/lib/minigames/kit.js` | changed | 41,928 | 44,134 | **Shared file.** Seven small changes (section 3). |
| `AR/lib/minigames/napkins.js` | changed | 16,255 | 16,506 | Napkin Please. At `stop()` it now removes the two screen boxes it makes when the page has none of its own (section 2). |
| `AR/lib/minigames/onlylight-find.js` | changed | 24,029 | 24,128 | Light the night. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/pin-memories.js` | changed | 22,123 | 22,160 | Pin the memories. Its spare address for the painting’s picture now starts from the game’s own file (section 2). |
| `AR/lib/minigames/possible-window.js` | changed | 26,873 | 26,972 | Show her. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/raised-up.js` | changed | 32,265 | 32,364 | Raise them up. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/reach-out.js` | changed | 29,926 | 29,963 | Reach out. Its spare address for the painting’s picture now starts from the game’s own file (section 2). |
| `AR/lib/minigames/scope-selftalk.js` | changed | 30,000 | 30,095 | Healthy self-talk. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/selfworth-door.js` | changed | 18,699 | 18,665 | Set it down. No `requestAnimationFrame` any more (section 2). |
| `AR/lib/minigames/temp-hands.js` | changed | 18,061 | 18,321 | Hands up, hands down. The call sign on the painting now fits its words (section 2). |
| `AR/lib/minigames/visions-eye.js` | changed | 20,430 | 20,529 | Catch the words. Its pictures now load from the game’s own file (section 2). |
| `AR/lib/minigames/voice.js` | changed | 9,741 | 10,067 | **Shared file.** One small change (section 3). |
| `AR/world-test.html` | changed | 10,208 | 13,397 | The test room now runs any of the 70 games, read from `gallery-games.json`. It used to have five games built in. |

## 2. What changed in the games, and why

**Pictures that would have been missing in the gallery (10 games).** These games wrote their picture folder from the AR page (`'media/games/beauty/'`). On the gallery's page that address points into `3D/`, where nothing is. They now use `new URL('../../media/games/…/', import.meta.url)`, like the rest. The ten: Dance in the flowers (`beauty-dance.js`), Calm the crossing (`communion-bridge.js`), Robot dance party (`fearless-dance.js`), Ride by feel (`harley-ride.js`), Style the dream (`haute-style.js`), Light the night (`onlylight-find.js`), Show her (`possible-window.js`), Raise them up (`raised-up.js`), Healthy self-talk (`scope-selftalk.js`), Catch the words (`visions-eye.js`).

**A spare address for the painting's picture (6 games).** These use `work.image`, and fall back to `'targets/<id>.jpg'` if the host gives none. The gallery always gives one, so this never ran there. The spare address now starts from the game's own file too: `cane-beat.js`, `coaster-track.js`, `hair-still.js`, `haute-style.js`, `pin-memories.js`, `reach-out.js`.

**No `requestAnimationFrame` (1 game).** Set it down (`selfworth-door.js`) used one `requestAnimationFrame` call, once, to nudge a panel. It is gone. No game uses `requestAnimationFrame` now.

**Napkin Please leaves nothing behind.** On the AR page its two screen boxes (`#mgHud`, `#mgBig`) belong to the page. Anywhere else the game makes them itself, and it used to leave them in the page, hidden, after `stop()`. It now removes the ones it made. On the AR page nothing changes.

**First flight: no three.js warning.** `hnw-flight.js` showed its butterfly before the butterfly's picture had loaded, so three.js printed “Texture marked for update but no image data found”. The butterfly now stays hidden until the picture is there.

**Hands up, hands down: the call sign fits.** The sign above the stage (`temp-hands.js`) read “ANDS DOWN”: the words were too wide for it. They now shrink until the whole call fits.

## 3. Changes in the shared files

**`kit.js`: seven small changes.** How a game calls the kit has not changed.

Nothing left behind after `stop()`:

1. `ui().pop()`: a “+1” tag that is still rising when the game stops had a timer that ran on for up to 0.8 s. `destroy()` now stops it.
2. `finale()`: the painting's animation starts 0.9 s after the end panel shows. `cleanup()` now stops that timer.
3. `quotePlay()`: the watcher that starts the artist's own recording used to stop itself up to a quarter of a second after the game. `quoteStop()` now stops it at once.

Everything fits on a phone. These two you can see, and they show on the AR page too:

4. The button row (`ui().buttons()`): when a row is too wide for the screen, all its words now shrink together until it fits. Before, three wide buttons, such as LEFT, MIDDLE and RIGHT in Block the shot, pushed the last one off the edge of a phone 390 px wide or narrower. If even the smallest size is not enough, the row goes onto two lines at full size: that is Say it from the creek after a take, with five buttons, where Next and Done used to be off the edge. A row that already fitted looks exactly as it did.
5. `ui().end()`: the row of score cells now always fits inside the end panel. Four cells (5 Weeks on My Side), or three long scores (Robot dance party), used to push the last score off the edge. The cells first lose a little padding; if that is not enough, the big numbers shrink together.

And two more:

6. `QUOTE_CLIPS`: one more entry, `'almost-blindness': 'art_1'`. Sound safari relied on its host for the artist's recording at the end (`work.overlay.clip`). The gallery gives none, so the computer voice read Ben's quote. Now the kit plays `3D/gallery/audio/art_1.mp3`, which is the same recording as the AR page's clip.
7. `sprite()`: a sprite with no colour of its own no longer hands three.js `color: undefined`. three.js printed a console warning for each one.

**`voice.js`: one small change.** Each spoken clip has a timer “in case `ended` never comes”. It is now put away when the clip ends and when the voice is stopped. Before, it could fire once after a game had stopped. It did nothing then, but it was a timer left behind.

**Not changed:** `voice-lines.js`, `in-world.js`, `index.js`, `quick-intros.js`.

## 4. How `gallery-games.json` was made

It has 70 entries, in the order of `AR/artworks.js`.

- **`key`.** The keys are the 70 names in `anims` in `3D/gallery/gallery.json`, each used exactly once. For 69 paintings the key is the name of the animation the AR page already plays for that painting (`overlay.anim` in `AR/artworks.js`). The 70th, 5 Weeks on My Side, is `5_weeks_ben_fox_270128946`. I then compared each painting's AR photo (`AR/targets/<id>.jpg`) with the gallery's picture for its key (`3D/gallery/img/<key>.webp`). All 70 pairs are the same picture, and no painting is closer to another key's picture. For the 21 New Artists Wing paintings, the key is also the `img` name of the piece with the same title in `wing.artists[].pieces`.
- **`id`.** All 70 paintings already have an AR id in `AR/artworks.js`, the 21 wing paintings included. I made none up.
- **`file` and `fn`.** As in `index.js`. Every file is there and exports that function.
- **`name`.** The game's own name, as on its start banner, kept to a few words. For your five I kept your names.
- **`title`, `artist`, `quote`.** Copied from `AR/artworks.js`, character for character.
- **`image`.** `targets/<id>.jpg` for all 70. Every painting has an AR target photo, the wing paintings too. Each is the same size and the same picture as the gallery's `img/<key>.webp`, and it is the picture the games were built on.
- **`story`.** By your rule: `media/clips/<id>.mp4` for 48 paintings; `../3D/gallery/audio/art_10.mp3` for Reflections of Sisterhood; and for the 21 wing paintings their voice clip, `../3D/gallery/audio/wing_<artist>_<piece>.mp3` (the `au` of the piece in `gallery.json`). See section 5, item 2.
- **`again`.** `true` for all 70. Every game starts cleanly again with `play.restart()`: the robot pressed Play again in each one.

## 5. Still unfinished, and yours to decide

1. **Check the keys against `painting-media-for-games.md`.** I never had that table. I expect no differences, because the keys come from your own `gallery.json`.
2. **`story` for the 21 wing paintings.** I used their voice clips, as you asked. Those 21 paintings also have a short clip of their own at `media/clips/<id>.mp4`, and that is what the AR page's story button plays. If you would rather have the film, change `story` for those 21.
3. **Play again.** Your list today has Play again only for Napkin Please. The other four of your five (See it my way, Light memory, Fish for the sisters, Family apples) restart cleanly too, so I set `again` to `true` for them as well. If you left it off on purpose, set those four back to `false`.
4. **Tilt on an iPhone needs the tap.** Five games can be played by tilting the phone: Hold still (5 WEEKS ON MY SIDE), Dance in the flowers (All Life’s Beauty), Metamorphosis (The Gray Zone), Robot dance party (Fearless Request), Tides of decision (Decision Divide). An iPhone only allows that if the game asks inside the tap. The games ask in `start()`. The gallery loads the game's file after the tap, so the ask may come too late. If so, the game still plays with its buttons, or by dragging. To keep tilt, load the game's file before the tap, as `world-test.html` does.
5. **A keyboard on a computer.**
   - Every game button is a real button. Tab reaches it, and Space or Enter presses it. Holding the key holds a hold button.
   - 68 of the 70 games have buttons, and in most of them the buttons do everything.
   - About a dozen games are played on the painting itself, by moving a light, rubbing, or tapping a spot. Their only buttons are helpers such as Hint or Listen. On a computer those need the mouse; there is no keyboard-only way to play them. The ones I know of: Napkin Please, Sound safari, See it my way, Night light, Light the night, Light the glass, Metamorphosis, Family apples, Call and answer, Still me, Pieces of me and Raise them up. Three of those are among your five, so the gallery already works this way. I have not gone through all 70 to prove which can be finished with the keyboard alone.
   - While its intro is being spoken, a game takes any key press or tap as “start now”. After that no game listens for keys of its own; only its buttons do.
   - A key pressed on a game button also reaches your page's own key handler, because the kit does not stop it. So Space on a button reaches your jump key as well.
6. **Napkin Please has no artist's quote at its end.** It ends with the avalanche, as it does in the gallery today. I did not change that.
7. **Media folders are not named after the AR id.** Each game's pictures are in `AR/media/games/<short name>/` (`napkins`, `memory`, `beauty`…), as they have been all along. They are already on the live site, so I did not move them. Section 9 lists them.
8. **What I could not test from here.** A real phone, and the real gallery page (the fox, the rooms, your buttons). The games use the microphone, the tilt sensor and the phone's own voice in ways a robot can only stand in for.

## 6. What a game needs from the gallery

The same as your five today:

- `work.id`: the AR id. The kit uses it to choose Ben's voice lines and the artist's recording.
- `work.title`, `work.artist`, `work.quote`: for the end panel and the name on the story button.
- `work.image`: the painting's picture, as a full address. 47 games draw with it.
- `work.overlay.anim`: the painting's animation, `gallery/anim/<key>.mp4`. It fades in over the painting at the end.
- `say`, `buzz`, `story`, `onEnd`: as now.

Nothing else is needed. The artist's own recording at the end needs nothing from you: 48 games play it themselves and 21 get it from a table in the kit, all from `3D/gallery/audio/`, addressed from the game's own file. Napkin Please is the one game with none.

`image` and `story` in the list are written from the `AR` folder, so `new URL(entry.image, AR)` gives the full address, where `AR` is the address of the `AR/` folder (your `gallery-games.js` already has it). This is how `world-test.html` turns one entry into what your `start()` uses today:

```js
const g = { file: e.file, fn: e.fn, name: e.name, again: e.again, story: new URL(e.story, AR).href,
  work: { id: e.id, title: e.title, artist: e.artist, quote: e.quote, image: new URL(e.image, AR).href,
          overlay: { anim: 'gallery/anim/' + e.key + '.mp4' } } };
```

Every painting in the gallery hangs on a square canvas, so every game gets `ctx.h = 1`. Two paintings are not quite square on the AR page (The Power Within and A Bright Future). Their games were played at `ctx.h = 1` like the rest, and they fill the square canvas as the painting's film does.

## 7. Games with a microphone, a tilt sensor or a typing box

Every one of these can also be played without it.

- **Microphone (7):** Hum it back (Rhythm of Life), Say it from the creek (The Bridge of Perception), What should I paint? (Flow State), Healthy self-talk (The Scope of Communication), Blow the storm away (Harmonious Gathering), Breathe the beauty (Live the Beauty), Move the needle (Move the Needle). Without a microphone the player holds a button or types.
- **Speech recognition (4):** Ride the block (Pedals of Freedom), Say it from the creek (The Bridge of Perception), What should I paint? (Flow State), Healthy self-talk (The Scope of Communication). Where the browser has none, the buttons do the same.
- **Tilt (5):** see section 5, item 4.
- **A typing box (3):** Say it from the creek (The Bridge of Perception), What should I paint? (Flow State), Healthy self-talk (The Scope of Communication). Your gallery's key handler already ignores keys typed in an `input`, so typing does not move the fox.

## 8. How it was tested

`AR/world-test.html` is now a stand-in for the gallery that runs any of the 70 games. It reads `gallery-games.json`, loads only that painting's game file, by its address, and hands the game the same things your gallery hands it: `work` with full addresses, `say`, `buzz`, `story` and `onEnd`. Its painting is a square canvas on a side wall. It shows the same two buttons as the gallery, Leave during a game, and Play again and Leave the game at the end.

- `world-test.html` shows the list of all 70 paintings.
- `world-test.html?art=<AR id or gallery key>` opens one painting.
- Add `&bot=1` and the game plays itself. Add `&auto` and it starts without the tap.

To load the games exactly as the gallery does, the robot used a copy of that page placed inside `3D/`, with the gallery's own `vendor/three/three.module.js`. That is how the ten missing-picture games showed up. The copy is not in the zip.

**Robot 1: the game plays itself.** For each of the 70 games, on a 390 by 844 screen:

1. It opened the painting in the test room and pressed Play with a real tap. No game made a sound before the tap.
2. It let the game play itself to the end (`&bot=1`). All 70 finished. The quickest took 7 seconds, the slowest 152, and half took under 56.
3. It read the end panel. 69 games show the artist's quote in full, word for word. Napkin Please shows none (section 5, item 6).
4. It pressed Play again, waited 8 seconds, and pressed Leave in mid-game. All 70 started again cleanly.
5. It looked for anything left behind: boxes on the page, things in the 3D scene, listeners, timers still running, sound, and anything still playing. Nothing was left in any game.

No file failed to load in any game, and there were no errors.

**Robot 2: played like a person.** No self-play this time. For each of the 70 games it pressed Play, tapped to skip the intro, pressed every game button with a real click, tapped and dragged on the painting, and left with Escape. All 70 ran with no errors and no missing files, no game button ran off the screen or sat under your Leave button, and nothing was left behind. Eleven games with three or more buttons were measured on a 360 px screen as well: every row fits.

**The AR page.** Every file changed here also runs on the AR page, so the robot from the earlier check-up replayed 33 games there: every game whose file changed, your five, and others that lean on the kit's changes. It played 14 of them to the end, stopped them, and started and stopped them once more. It gave the other 19 a short start, a stop and a second start. No errors, no missing files, and nothing left behind.

**Timers, to be exact.** After `stop()` nothing a game made runs in any way you can see or hear. Two kinds of short timer can still be waiting at that moment, as in your five games today. One is the music's fade-out, so that there is no click: about half a second in most games and 2.5 seconds at most, after which it lets go of its sound nodes. The other is a short visual delay (a wave of the band in Jazz says, a row of car horns in Clear the roads): each checks that the game is still there, and does nothing if it is not.

**The zip.** I unpacked the zip over a clean copy of the live site at the same commit and ran the checks again from there: the list (70 entries, with their keys, files, functions, pictures and stories), a strict syntax check of all 147 game files as ES modules, robot 2 on all 70 games, and robot 1 on seven. All of it passed.

## 9. Where each game's media is (nothing to copy)

All of it is already on the live site. Pictures are in `AR/media/games/<folder>/`. Ben's voice lines are in `AR/media/voice/<prefix>….mp3`; the number in brackets is how many lines the game has, and every one is recorded. The last column is the artist's own recording that the game plays at the end, from `3D/gallery/audio/`.

| Painting | AR id | Game file | Picture folder | Voice lines | Artist's recording |
|---|---|---|---|---|---|
| Napkin, Please | `napkin-please` | `napkins.js` | `napkins/`, `napkin-please-empty.jpg` | `napkin-` (104) | no |
| Almost Blindness | `almost-blindness` | `almost-blindness-safari.js` | none (drawn in code) | `safari-` (33) | art_1.mp3 |
| Walk Through Fear | `walk-through-fear` | `walk-through-fear-see.js` | none (drawn in code) | `see-` (41) | art_63.mp3 |
| Curating Hope | `curating-hope` | `curating-hope-memory.js` | `memory/` | `memory-` (17) | art_2.mp3 |
| One Love | `one-love` | `onelove-band.js` | `onelove/` | `love-` (20) | wing_0_2.mp3 |
| Pour In The Love | `pour-in-the-love` | `pour-love.js` | none (drawn in code) | `pour-` (22) | art_5.mp3 |
| 5 WEEKS ON MY SIDE | `5-weeks-on-my-side` | `weeks-still.js` | none (drawn in code) | `weeks-` (31) | art_0.mp3 |
| All Life’s Beauty | `all-lifes-beauty` | `beauty-dance.js` | `beauty/` | `flower-` (16) | art_7.mp3 |
| All the Possibilities | `all-the-possibilities` | `possible-window.js` | `possible/` | `show-` (15) | art_11.mp3 |
| Midnight Melodies | `midnight-melodies` | `midnight-melodies.js` | none (drawn in code) | `night-` (48) | art_22.mp3 |
| GOALBALL IS... | `goalball-is` | `goal-block.js` | none (drawn in code) | `goal-` (23) | art_42.mp3 |
| Rhythm of Life | `rhythm-of-life` | `rhythm-of-life.js` | none (drawn in code) | `glow-` (22) | art_40.mp3 |
| Reaching Past Blindness | `reaching-past-blindness` | `reach-out.js` | none (drawn in code) | `strum-` (21) | art_20.mp3 |
| Music On The Streets | `music-on-the-streets` | `cane-beat.js` | none (drawn in code) | `cane-` (28) | art_13.mp3 |
| Telephone Poles | `telephone-poles` | `poles-drive.js` | none (drawn in code) | `poles-` (20) | art_46.mp3 |
| Rhapsody in Blue | `rhapsody-in-blue` | `rhapsody-simon.js` | none (drawn in code) | `jazz-` (24) | art_26.mp3 |
| Reliroo | `reliroo` | `fetch-relish.js` | `reliroo/` | `relish-` (18) | art_27.mp3 |
| Pedals of Freedom | `pedals-of-freedom` | `pedals-ride.js` | `pedals/` | `ride-` (16) | art_36.mp3 |
| Joyride | `joyride` | `joyride-sunset.js` | `joyride/` | `joy-` (55) | art_49.mp3 |
| Roller Coaster Of Emotions | `roller-coaster-of-emotions` | `coaster-track.js` | none (drawn in code) | `track-` (39) | art_14.mp3 |
| Back of a Harley | `back-of-a-harley` | `harley-ride.js` | `harley/` | `harley-` (16) | art_47.mp3 |
| Pathways Unveiled | `pathways-unveiled` | `pathways-safari.js` | none (drawn in code) | `road-` (15) | art_9.mp3 |
| Find Your Village | `find-your-village` | `village-magnet.js` | none (drawn in code) | `village-` (23) | art_3.mp3 |
| The Only Light We’ll See | `the-only-light-well-see` | `onlylight-find.js` | `onlylight/` | `moon-` (35) | art_8.mp3 |
| A New Day | `a-new-day` | `newday-glass.js` | none (drawn in code) | `glass-` (27) | art_12.mp3 |
| The Dark Uncertainty | `the-dark-uncertainty` | `dark-uncertainty-play.js` | `dark-uncertainty/` | `bus-` (14) | art_41.mp3 |
| The Gray Zone | `the-gray-zone` | `gray-metamorphosis.js` | none (drawn in code) | `meta-` (22) | art_59.mp3 |
| Lighthouse of Hope | `lighthouse-of-hope` | `lighthouse-riddles.js` | none (drawn in code) | `light-` (34) | art_45.mp3 |
| Fearless Request | `fearless-request` | `fearless-dance.js` | `fearless/` | `dance-` (25) | art_24.mp3 |
| Take Time to Bloom | `take-time-to-bloom` | `bloom-clock.js` | none (drawn in code) | `bloom-` (24) | art_4.mp3 |
| HOPE IS NOT LOST | `hope-is-not-lost` | `hope-fly.js` | `hope/` | `hope-` (20) | art_35.mp3 |
| The Bridge of Perception | `the-bridge-of-perception` | `bridge-karaoke.js` | none (drawn in code) | `creek-` (19) | art_39.mp3 |
| Flow State | `flow-state` | `flow-talk.js` | none (drawn in code) | `paint-` (25) | art_44.mp3 |
| Inner Peace in Outer Chaos | `inner-peace-in-outer-chaos` | `inner-peace-walk.js` | none (drawn in code) | `calm-` (17) | art_60.mp3 |
| Reflections of Sisterhood | `reflections-of-sisterhood` | `reflections-fish.js` | none (drawn in code) | `fish-` (21) | art_10.mp3 |
| The Scope of Communication | `the-scope-of-communication` | `scope-selftalk.js` | `scope/` | `talk-` (22) | art_25.mp3 |
| The Visions That We Share | `the-visions-that-we-share` | `visions-eye.js` | `visions/` | `eye-` (23) | art_43.mp3 |
| The Harmony of Vision | `the-harmony-of-vision` | `harmony-tune.js` | none (drawn in code) | `harmony-` (25) | art_57.mp3 |
| Roots of Kinship | `roots-of-kinship` | `roots-apples.js` | none (drawn in code) | `apples-` (30) | art_6.mp3 |
| Harmonious Gathering | `harmonious-gathering` | `harmonious-weather.js` | none (drawn in code) | `storm-` (18) | art_28.mp3 |
| Embracing Unity | `embracing-unity` | `unity-call.js` | `unity/` | `unity-` (79) | art_51.mp3 |
| Reasons for a Cure | `reasons-for-a-cure` | `pin-memories.js` | none (drawn in code) | `cure-` (20) | art_21.mp3 |
| SEEING THE WORLD TOGETHER | `seeing-the-world-together` | `wife-song.js` | none (drawn in code) | `wife-` (20) | art_34.mp3 |
| Haute Couture Dreams | `haute-couture-dreams` | `haute-style.js` | `haute/` | `style-` (94) | art_50.mp3 |
| The Power Within | `the-power-within` | `power-hop.js` | `power/` | `power-` (34) | art_58.mp3 |
| Moment of Communion | `moment-of-communion` | `communion-bridge.js` | `communion/` | `cross-` (20) | art_23.mp3 |
| A Bright Future | `a-bright-future` | `steps-climb.js` | `steps/` | `steps-` (21) | art_55.mp3 |
| I Am Blind, Like My Hair Is Brown | `i-am-blind-like-my-hair-is-brown` | `hair-still.js` | none (drawn in code) | `still-` (35) | art_15.mp3 |
| The Mirror | `the-mirror` | `mirror-light.js` | none (drawn in code) | `mirror-` (40) | art_61.mp3 |
| Decision Divide | `decision-divide` | `decision-tides.js` | none (drawn in code) | `tides-` (14) | art_64.mp3 |
| The Button is to the Left | `the-button-is-to-the-left` | `button-cross.js` | `button/` | `button-` (25) | wing_0_0.mp3 |
| Light on the Other Side | `light-on-the-other-side` | `roll-keep.js` | `roll/` | `roll-` (20) | wing_0_1.mp3 |
| Art Raised Me Up | `art-raised-me-up` | `raised-up.js` | `raised/` | `raise-` (44) | wing_1_0.mp3 |
| A Different Way to See | `a-different-way-to-see` | `diffway-lines.js` | none (drawn in code) | `diffway-` (31) | wing_1_2.mp3 |
| Live the Beauty | `live-the-beauty` | `live-breathe.js` | none (drawn in code) | `breathe-` (26) | wing_1_1.mp3 |
| How, Not Who | `how-not-who` | `hnw-flight.js` | `hnw/` | `flight-` (23) | wing_3_0.mp3 |
| Invisibly, Ours | `invisibly-ours` | `crowd-meet.js` | none (drawn in code) | `crowd-` (11) | wing_3_1.mp3 |
| Unstoppable | `unstoppable` | `unstop-tree.js` | none (drawn in code) | `lotus-` (15) | wing_3_2.mp3 |
| Fellowship | `fellowship` | `fellowship-pass.js` | none (drawn in code) | `fellow-` (12) | wing_5_0.mp3 |
| Move the Needle | `move-the-needle` | `needle-voice.js` | none (drawn in code) | `needle-` (25) | wing_5_1.mp3 |
| Self-Worth: A New Understanding | `self-worth-a-new-understanding` | `selfworth-door.js` | none (drawn in code) | `worth-` (28) | wing_5_2.mp3 |
| Beauty in the Blurry | `beauty-in-the-blurry` | `blurry-wake.js` | none (drawn in code) | `blur-` (30) | wing_2_0.mp3 |
| Everything in Its Place | `everything-in-its-place` | `place-putback.js` | `place/` | `place-` (40) | wing_2_1.mp3 |
| The Temperature Setter | `the-temperature-setter` | `temp-hands.js` | none (drawn in code) | `heat-` (11) | wing_2_2.mp3 |
| Strengths & Limitations | `strengths-limitations` | `strengths-crew.js` | none (drawn in code) | `crew-` (19) | wing_6_0.mp3 |
| Where People Are | `where-people-are` | `where-ask.js` | none (drawn in code) | `circle-` (22) | wing_6_1.mp3 |
| Full Immersion | `full-immersion` | `immersion-senses.js` | none (drawn in code) | `street-` (33) | wing_6_2.mp3 |
| Comfort in the Uncomfortable | `comfort-in-the-uncomfortable` | `drop-in.js` | `drop/` | `drop-` (37) | wing_4_0.mp3 |
| Spectrum of Sight | `spectrum-of-sight` | `spectrum-between.js` | none (drawn in code) | `ring-` (45) | wing_4_1.mp3 |
| Wet Floor Signs, Beware! | `wet-floor-signs-beware` | `shwak-signs.js` | `shwak/` | `shwak-` (30) | wing_4_2.mp3 |
