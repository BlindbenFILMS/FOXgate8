# MERU 2.0 — AUDIO HOOKS (for Ben's voice script + sound design)

Engine: `worlds/meru2-audio.js` (built by the walk, `worlds/meru2-walk.js`). Rules it follows: `SOUND_LAYOUT_RULES.md`.
Drop files into the project, list them in `MERU/audio/manifest.json`, reload. Anything not listed plays a synth placeholder.

## manifest.json
```json
{
  "music": { "town": "MERU/audio/music/town.mp3", "market": "MERU/audio/music/market.mp3" },
  "rooms": { "casino": "MERU/audio/rooms/casino-bed.mp3", "tavern": "MERU/audio/rooms/tavern-bed.mp3" },
  "voice": { "monk": { "greet": "MERU/audio/voice/monk/greet.mp3" }, "kia": { "greet": "MERU/audio/voice/kia/greet.mp3" } }
}
```
- **music** key = the zone's `music` value in `ZONES` (worlds/meru2-layout.js): town · market · court · civic · gardens · castlepath · barracks · arenapath · arena · skate · ruinspath · ruins · lakepath · lake · island · falls · ridge · park. Looping. 2.8 s crossfade. Busy zones play at 45 %. Indoors music drops to 25 %. Under a voice it ducks to 50 %.
- **rooms** key = the building key in `BUILDINGS` (tavern, casino, bowling, itemshop, armory, fortune, burgers, police, jail, bank, carRental, crest, lake, stationTown, barracks, tankWorks, tankRange, defense, stationCastle, stationRuins, museum, permit, cave, blindSchool, boatworks, boathouse, stationLake, stationPearl, stationArena). Looping bed. Inside: full level, plus the room's named reverb if it has one. Outside: leaks from each door (55 % at the threshold, half at 6.8 m, silent at 11 m, low-passed).
- **voice** key = the pinned speaker key in `SPEAKERS`. `greet` plays when you walk past (7 m outdoors, 5.5 m indoors, one at a time, 20 s rest per fox, same room only), through a 3D panner at the fox.

## Calls for the dialogue system
- `walker.say(key, url)` plays one line at that fox (panned, room reverb, music ducked). Returns a promise that resolves when the line ends. Use one call per line.
- `walker.sound.events.onGreet = key => {}`, `.onZone = zoneKey => {}`, `.onRoom = roomKey => {}`: fire when they change.
- `walker.sound.info()` returns `{ music, room, voice, leak }`. The walk HUD chip shows the same values.
- `walker.sound.rooms` = the room table (key, centre, w, d, floor, reverb, doors). `walker.sound.speakers` = every speaking fox with its world position and room.

## Already wired with real recordings
- `MERU/audio/monk-sermon.mp3`: the Monk at the fountain (looping, 6 s rest, heard within 26 m).
- `MERU/audio/talk-fish1-4.mp3`: the fish-talk pair by the fisherman at the lake (14 s rest).
- `MERU/audio/talk-bowling1-2.mp3`: the bowling-talk pair in Meru Lanes (18 s rest, inside only).

## Reverb names (from BUILDINGS.reverb)
"cave, long tail" = 3.2 s · "marble hall, a little tail" = 0.9 s · drill hall / station hall / old stone hall = 1.8 s · anything else named = 1.2 s · unnamed rooms are dry.
