# Blind Canvas gallery: the New Wing style

Ben picked the New Artists Wing as the house style on 1 Oct. Every new or rebuilt part of the gallery follows these rules. The code that builds them is `engine/gallery-wing.js` (the wing and rooms) and `engine/gallery-remodel.js` (carving, the entrance, restyled art).

## Space
- **Walkways are wide.** Main walkways are at least 5.6 m wide and rooms are 18 m wide. Leave 3 m or more of clear floor behind anything people stop at, such as screens, totems and kiosks, so a player can turn around (and a wheelchair fox too).
- **One continuous floor.** There are no gaps, no steps up onto a walkway and no pockets under ramps. Skirt the low end of a ramp down to the floor.
- **Railed edges.** Where a floor drops away, add a red handrail at 1.07 m, a faint glass panel (ink at 18% opacity, which also handles collision so you can't fall), and ink posts about every 2 m. Leave landings open so people can step off sideways.
- Ramps run about 25° at most, with a flat landing at the bottom and at least 2 m before the next object.

## Colour
| Use | Colour |
|---|---|
| Walls, plinths | gallery white `#eceae6` |
| Canvas sides, ceilings | `#f4f2ee` / `#f6f5f3` |
| Ink: baseboards, fascia, posts, totems, title panels | `#1d1c1b` |
| Accent: rule line, handrails, plaque call-to-action | red `#ec3013` |
| Bio boards | slate `#3d4046` with a red top bar |
| Floors | honey-oak planks (`makeWood`, hue 32, sat 46, light 45), world-space, 4 m per tile |

- **The original building:** neutral grey walls are repainted gallery white by the shader, and white floors become oak (`woodify(..., walls = true)`). Black and coloured surfaces keep their colour.
- **The red rule line** runs at 4.9 m on room walls. Ink baseboards are 0.18 m.

## Art
- **Frameless canvases.** Each artwork sits on the face of a shallow box, 0.07 m deep with white sides, standing proud of the wall. There are no frames.
- **Plaques.** Plaques are off-white `#f9f8f6` with an ink bar on the left, the title in Archivo 800, the artist in grey, and a red "APPROACH TO VIEW · READ ALOUD" line. They hang low so you can walk right up and read them: wall cards are 3.4 × 1.75 m (2.35 m with a quote) with the bottom edge 0.75 m off the floor, beside the art. Wing plaques are 3.3 × 0.9 m under each canvas.
- **Bio boards.** Bio boards are slate with ARTIST in salmon `#ff9783`, the name in white caps, a short red rule, then the bio. Every artist uses the same board, in the wing and on the main gallery's artist kiosks. Short bios get bigger type.
- **Living paintings.** When an artwork has an animated version, it fades in over the still (0.9 s) while you stand in front of it and fades back out when you walk away. It's silent and loops forward then back.
- **Interview totems.** A dark 3.6 × 2.0 m screen sits on an ink post and base plate. A totem can be two-sided when it serves two bays. Its video plays only while you stand in its zone.
- **End walls.** Each room ends in a dark title panel: a salmon kicker, a big white title and a red vertical bar.

## Type
Archivo (fallback Arimo, Helvetica). Use 800 weight for titles and labels and 400–500 for body text. Text is flush left, in sentence case except kickers, with no rounded corners.

## Light
Light strips run along the ceiling every 7.5 m, two rows at ±4 m. There are no extra real-time lights, to stay in the phone budget.

## How to add a room
Add an entry to `gallery.json` → `rooms` with `O` (origin on the floor), `rotY`, `doorW`, `L` and the `artists` (name, sub, bio, pieces [{title, img}], video). If the new room replaces part of the old building, add a carve region in `CARVES` (`gallery-remodel.js`) so the old geometry, signs and screens there are removed.
