// ─────────────────────────────────────────────────────────────
//  BLIND CANVAS AR: ARTWORK LIST
//  One entry per artwork. Each artwork gets its own link:
//     .../AR/?art=<id>
//  Make the .mind file and a ready-to-paste entry with add.html
// ─────────────────────────────────────────────────────────────
//
//  id           short name used in the link (letters, numbers, dashes)
//  title        artwork title (spoken and shown)
//  artist       artist name
//  target       the tracking file made by add.html  (targets/<id>.mind)
//  image        the photo of the artwork            (targets/<id>.jpg)
//  width/height size of that photo in pixels (sets the overlay shape)
//  description  audio description, read aloud when the art is found
//  narration    optional recorded audio (mp3/m4a) to play instead of
//               the read-aloud voice, e.g. 'media/fox-narration.mp3'
//  overlay      what appears on the artwork:
//                 { type: 'magic' }                       glow + sparkles
//                 { type: 'video', src: 'media/x.mp4' }   video over the art
//                 { type: 'image', src: 'media/x.png' }   picture over the art
//  hotspots     tap-to-hear spots, in photo pixels from the top-left:
//                 { name, x, y, r, label, glow: true/false, color: '#hex' }
//               name is the short button text; label is what's spoken
// ─────────────────────────────────────────────────────────────

export const ARTWORKS = [
  {
    id: 'fox-at-dusk',
    title: 'Fox at Dusk',
    artist: 'AR Test Canvas',
    target: 'targets/fox-at-dusk.mind',
    image: 'targets/fox-at-dusk.jpg',
    width: 900,
    height: 1200,
    description:
      'Fox at Dusk. A tall painting. A huge orange sun sets in the middle of the canvas, ' +
      'glowing yellow at its center, behind three layers of purple mountains that get darker toward the bottom. ' +
      'The sky above is deep navy blue, scattered with white and gold stars. ' +
      'At the bottom center, a bright orange fox with two tall pointed ears looks straight at you. ' +
      'It has small black eyes and a cream colored chin. ' +
      'Tiny shapes in yellow, sky blue, pink and green are scattered across the mountains like confetti. ' +
      'A border of yellow and blue dashes runs around the edge. ' +
      'Tap the screen on the sun or the fox to hear more.',
    narration: null,
    overlay: { type: 'magic' },
    hotspots: [
      { name: 'The sun', x: 450, y: 520, r: 220, glow: true, color: '#ffb347',
        label: 'The setting sun. A wide circle of warm orange, fading to pale yellow at its center.' },
      { name: 'The fox', x: 450, y: 990, r: 110, glow: false, color: '#ff8a3d',
        label: 'The fox. Orange, with tall pointed ears, black eyes, and a cream chin. It is looking right at you.' },
      { name: 'The title', x: 450, y: 110, r: 120, glow: false, color: '#ffffff',
        label: 'The title, Fox at Dusk, written in white capital letters across the top of the starry sky.' }
    ]
  }

  // Paste new artworks here, separated by commas. add.html writes them for you.
];
