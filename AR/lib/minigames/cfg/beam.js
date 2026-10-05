// BEAM games: settings for each painting (see engines/beam.js for what each setting means).
export default {
  // Craig Ellis: the moon-lamp on its stalk is the lighthouse; boats drift through the night toward the dark rocks.
  'lighthouse-of-hope': {
    engine: 'beam', title: 'Light the way home', kicker: 'Light the way home', unit: 'boats safe',
    how: 'Boats are lost at sea. Drag left or right, or hold the arrows, to swing the lighthouse beam. Hold the light on a boat to guide it past the rocks.',
    source: [0.295, 0.14], range: [-122, -38], start: -70, width: 11,
    spawn: [[0.6, 0.69, 0.88, 0.74], [0.14, 0.46, 0.34, 0.6], [0.4, 0.62, 0.56, 0.68], [0.66, 0.75, 0.86, 0.8]],
    danger: [[0.16, 0.76, 0.32, 0.84], [0.34, 0.74, 0.52, 0.8]],
    safe: [0.72, 0.7],
    lost: [{ e: '⛵', name: 'a sailboat' }, { e: '\u{1F6A3}', name: 'a rowboat' }, { e: '\u{1F6F6}', name: 'a canoe' }, { e: '\u{1F6A4}', name: 'a speedboat' }],
    found: [{ e: '⛵', name: 'Safe passage' }, { e: '\u{1F6A3}', name: 'Rowed home' }, { e: '\u{1F6F6}', name: 'Safe and sound' }, { e: '\u{1F6A4}', name: 'Home free' }],
    goal: 12, maxLost: 4, life: [10, 6.5], every: [3.2, 1.6], maxAt: 3, dwell: 0.8, turn: 90,
    color: '#ffe7a8', dark: 0.86, callF: 523.3, humF: 98,
    words: { appear: 'A boat in the dark', lostOne: 'On the rocks', lostSub: 'Reach the boats before the rocks do.' },
    win: { title: 'Every light came home', line: '“Hope is the light shining out of the lighthouse.” — Craig Ellis' },
    lose: { title: 'Keep the light burning', line: '“The first thing we give them is hope.” — Craig Ellis' },
  },
  // Wayne Pearcy: the robot's lantern lights the night; little friends wander in the dark and come to the boy once lit.
  'fearless-request': {
    engine: 'beam', title: 'Lantern in the night', kicker: 'Lantern in the night', unit: 'friends found',
    how: 'Friends are wandering in the dark. Drag left or right, or hold the arrows, to swing the lantern. Hold the light on a friend and it finds its way to the boy.',
    source: [0.475, 0.645], range: [18, 168], start: 95, width: 12,
    spawn: [[0.3, 0.34, 0.45, 0.5], [0.5, 0.3, 0.68, 0.45], [0.6, 0.5, 0.72, 0.6], [0.32, 0.52, 0.4, 0.58]],
    danger: [[0.17, 0.26, 0.22, 0.58], [0.26, 0.22, 0.74, 0.25], [0.8, 0.26, 0.85, 0.58]],
    safe: [0.36, 0.7],
    lost: [{ e: '\u{1F415}', name: 'A puppy' }, { e: '\u{1F408}', name: 'A kitten' }, { e: '\u{1F989}', name: 'An owl' }, { e: '\u{1F407}', name: 'A bunny' }, { e: '\u{1F98A}', name: 'A fox' }],
    goal: 10, maxLost: 4, life: [9, 6], every: [3, 1.8], maxAt: 3, dwell: 0.8, turn: 100,
    color: '#ffc96b', dark: 0.88, callF: 784, humF: 131,
    words: { appear: 'A friend is lost', lostOne: 'Slipped into the night', lostSub: 'Swing the lantern sooner.' },
    win: { title: 'Nobody walks alone', line: '“…if there is something I know will make my life a little bit easier, I’m not afraid to go out and ask for that help…” — Wayne Pearcy' },
    lose: { title: 'Ask the light again', line: 'The lantern is still lit. It is never too late to ask for help.' },
  },
};
