// Catch games: settings for each painting (see engines/catch.js for what each setting means).
export default {
  'pour-in-the-love': {
    engine: 'catch', title: 'Pour in the love', kicker: 'Pour in the love', unit: 'drops of love',
    how: 'Catch the drops of love in the heart. Let the ugly thoughts fall away.',
    lanes: [0.36, 0.51, 0.66], top: 0.3, line: 0.62, catcher: '\u{1F5A4}', color: '#ff7ab8',
    good: [{ e: '\u{1F496}', name: 'love' }, { e: '\u{1F49B}', name: 'love' }, { e: '\u{1F499}', name: 'love' }, { e: '\u{1F49C}', name: 'love' }],
    bad: [{ e: '\u{1F327}️', name: 'an ugly thought' }, { e: '\u{1F5EF}️', name: 'an ugly thought' }], badName: 'ugly thoughts', badChance: 0.3,
    goal: 16, maxMiss: 6, fall: [3.0, 1.6], every: [1.4, 0.7],
    win: { title: 'Your heart is full', line: '“It was time to pull all the ugly out and start pouring in the love.” — Steven McCoy' },
    lose: { title: 'Pour it in again', line: '“As I continued to drink that water of love… I did that by just being.” — Steven McCoy' },
  },
  // Ben on his side for five weeks after eye surgery: friends bring every VHS tape they have. Tapes clack as they're tossed.
  '5-weeks-on-my-side': {
    engine: 'catch', title: 'Every tape they had', kicker: 'Every tape they had', unit: 'tapes',
    how: 'Your friends are tossing you tapes. Tap the left, middle or right of the screen to slide the TV under each tape. Dodge the jolts: keep your head still.',
    lanes: [0.32, 0.5, 0.68], top: 0.2, line: 0.68, catcher: '\u{1F4FA}', color: '#ffcf6b', sound: 'tape',
    good: [{ e: '\u{1F4FC}', name: 'a tape', f: 659 }, { e: '\u{1F4FC}', name: 'a tape', f: 659 }, { e: '\u{1F37F}', name: 'popcorn', f: 880 }],
    bad: [{ e: '⚡', name: 'a jolt' }], badName: 'jolts', badHit: 'Easy, keep still!', badChance: 0.25,
    goal: 20, maxMiss: 6, fall: [3.0, 1.6], every: [1.4, 0.75],
    win: { title: 'Movie marathon', line: '“Watching movies with friends wondering about the future. Those were actually good times.” — Ben Fox' },
    lose: { title: 'Rewind and try again', line: '“Friends visited me often, and brought me every VHS tape they had.” — Ben Fox' },
  },
  // A woman reading in a meadow; blossoms stream from her book. Catch today's beauty in the book, let the fear of tomorrow drift by.
  'all-lifes-beauty': {
    engine: 'catch', title: 'Beauty still here', kicker: 'Beauty still here', unit: 'blossoms',
    how: 'Catch the falling blossoms in your book. Tap the left, middle or right of the screen. Let the grey fog of tomorrow drift past.',
    lanes: [0.32, 0.5, 0.68], top: 0.2, line: 0.72, catcher: '\u{1F4D6}', color: '#ffa94d', sound: 'bloom',
    good: [{ e: '\u{1F338}', name: 'a blossom', f: 1047 }, { e: '\u{1F33C}', name: 'a daisy', f: 880 }, { e: '\u{1F33A}', name: 'a hibiscus', f: 784 }, { e: '\u{1F33B}', name: 'a sunflower', f: 659 }, { e: '\u{1F337}', name: 'a tulip', f: 1175 }],
    bad: [{ e: '\u{1F32B}️', name: 'fear of tomorrow' }], badName: 'fog of tomorrow', badHit: 'Fear of tomorrow', badChance: 0.25,
    melody: [523.3, 659.3, 784, 659.3, 698.5, 880, 1046.5, 880, 784, 987.8, 1174.7, 987.8, 1046.5, 784, 659.3, 523.3, 784, 1046.5],
    goal: 18, maxMiss: 6, fall: [3.4, 1.8], every: [1.5, 0.8],
    win: { title: 'Arms full of today', line: '“Don’t let the fear of tomorrow take away the beauty you can still find today.” — Dave Steele' },
    lose: { title: 'Look again', line: '“Don’t let the fear of tomorrow take away the beauty you can still find today.” — Dave Steele' },
  },
  // Raquel meets her 12-year-old self: catch every path open to a blind girl. Each one has its own note and is spoken as you catch it.
  'all-the-possibilities': {
    engine: 'catch', title: 'Where she wants to go', kicker: 'Where she wants to go', unit: 'possibilities',
    how: 'Show the girl every path open to her. Tap the left, middle or right of the screen to catch each one. Each has its own note. Dodge the closed doors.',
    lanes: [0.32, 0.5, 0.68], top: 0.24, line: 0.6, catcher: '\u{1F932}', color: '#f2a541', announce: true,
    good: [{ e: '\u{1F3DB}️', name: 'Architect', f: 392 }, { e: '✍️', name: 'Poet', f: 440 }, { e: '\u{1F34E}', name: 'Teacher', f: 523.3 },
      { e: '\u{1F3B5}', name: 'Musician', f: 587.3 }, { e: '\u{1F4F7}', name: 'Photographer', f: 659.3 }, { e: '\u{1F3AC}', name: 'Filmmaker', f: 784 },
      { e: '\u{1F3A8}', name: 'Painter', f: 880 }, { e: '\u{1F483}', name: 'Dancer', f: 1046.5 }],
    bad: [{ e: '\u{1F6AA}', name: 'a closed door' }], badName: 'closed doors', badHit: 'A closed door', badChance: 0.22,
    goal: 16, maxMiss: 6, fall: [3.2, 1.8], every: [1.6, 0.9],
    win: { title: 'So many options', line: '“…so that little girl could decide where she wants to go in life and how many options she has.” — Raquel Alim' },
    lose: { title: 'Every door is still there', line: '“If I were able to sit down with my 12-year-old self, I would show her the art of other visually impaired people…” — Raquel Alim' },
  },
  // Young Wayne asleep with his new trumpet; the lamppost is a trumpet bell. Catch the dream notes and play a lullaby, dodge the alarm clock.
  'midnight-melodies': {
    engine: 'catch', title: 'Starlight solo', kicker: 'Starlight solo', unit: 'notes',
    how: 'Notes drift down from the stars. Tap the left, middle or right of the screen to catch them in the trumpet, and each one plays the lullaby. Dodge the alarm clocks.',
    lanes: [0.32, 0.5, 0.68], top: 0.22, line: 0.72, catcher: '\u{1F3BA}', color: '#ffd25a', sound: 'brass',
    good: [{ e: '\u{1F3B5}', name: 'a note', f: 523.3 }, { e: '\u{1F3B6}', name: 'notes', f: 587.3 }, { e: '⭐', name: 'a star', f: 784 }],
    bad: [{ e: '⏰', name: 'the alarm clock' }], badName: 'alarm clocks', badHit: 'The alarm clock!', badChance: 0.25,
    // Twinkle, twinkle, little star: the whole first line, one note per catch
    melody: [261.6, 261.6, 392, 392, 440, 440, 392, 349.2, 349.2, 329.6, 329.6, 293.7, 293.7, 261.6],
    goal: 14, maxMiss: 6, fall: [3.4, 2.0], every: [1.7, 1.0],
    win: { title: 'Sweet dreams', line: '“My dad bought me this trumpet and I was so excited about it. I remember I actually slept with that horn that night.” — Wayne Pearcy' },
    lose: { title: 'Back to sleep', line: '“I took it out of its case and I put it in bed with me. It was like it was a toy.” — Wayne Pearcy' },
  },
  // Goalball, the Paralympic sport for blind athletes: everyone wears eyeshades and defends the goal by the sound of the ball’s bells.
  'goalball-is': {
    engine: 'catch', title: 'Quiet please', kicker: 'Quiet please', unit: 'saves', missLabel: 'Goals against',
    how: 'Eyeshades on. The court goes dark. Listen for the ball’s bells rolling at you, and tap the left, middle or right of the screen to dive in front of it.',
    goSay: 'Quiet please. Play!',
    lanes: [0.33, 0.5, 0.67], top: 0.2, line: 0.72, catcher: '\u{1F938}', color: '#ffd23f', sound: 'bells', blindfold: 0.82, dimTo: 0.25,
    good: [{ e: '⚽', name: 'the ball' }],
    missHit: { title: 'Goal against', sub: 'Listen for the bells.', say: 'Goal' },
    goal: 20, maxMiss: 5, fall: [2.4, 1.4], every: [2.2, 1.3],
    win: { title: 'Goal defended', line: '“Goalball is probably the greatest sport, and not many people have heard of it.” — Ricky Ruzicka' },
    lose: { title: 'Shake it off', line: '“…I was so grateful at the time to be exposed to friends in the community who were thriving and who were so passionate about something.” — Ricky Ruzicka' },
  },
};
