// STACK games: settings for each painting (see engines/stack.js for what each setting means).
export default {
  'moment-of-communion': {
    engine: 'stack', title: 'Bridge the gap', kicker: 'Bridge the gap', unit: 'planks', pieceName: 'plank',
    how: 'Lay planks so the two sides can meet. Each plank slides up and down; tap anywhere when it lines up with the last one. Listen: the sound is centred and highest, with a click, when it lines up.',
    start: [0.318, 0.592], step: [0.031, 0], axis: 'y', span: 0.075, thick: 0.031, range: 0.11,
    count: 12, lives: 3, speed: [0.1, 0.17], perfect: 0.011,
    look: 'plank', colors: { a: '#d9a35a', b: '#8d5a2b', line: '#3d220c' }, notes: 'penta', color: '#ffe08a',
    walker: { e: '\u{1F6B6}', at: [0.29, 0.535], size: 0.07 }, waiter: { e: '\u{1F9CD}', at: [0.705, 0.535], size: 0.07 }, goal: [0.655, 0.535],
    doneAlert: 'The bridge is whole', doneSub: 'Now they can meet.',
    win: { title: 'You built the bridge', line: '“…we not only feel the same thing, we believe the same thing, and we have a trust and a symmetry that is elevating all of us at the same time.” — Marcus Roberts' },
    lose: { title: 'The gap is still there', line: '“…in those rare instances where not only do people connect, but they actually feel the same thing about each other…” — Marcus Roberts' },
  },
  'a-bright-future': {
    engine: 'stack', title: 'Steps of music', kicker: 'Steps of music', unit: 'steps', pieceName: 'step',
    how: 'Build her a staircase of music up toward the light. Each step slides left and right; tap anywhere when it lines up over the last one. Listen: the sound is centred and highest, with a click, when it lines up.',
    start: [0.66, 0.47], step: [-0.026, -0.02], axis: 'x', span: 0.09, thick: 0.026, range: 0.1,
    count: 10, lives: 3, speed: [0.12, 0.2], perfect: 0.012,
    look: 'score', colors: { a: '#fff6e0', b: '#ffb35c', line: '#4a2410' }, notes: 'major', color: '#fff2a8',
    walker: { e: '\u{1F467}', at: [0.72, 0.4], size: 0.065 }, goal: [0.41, 0.3],
    doneAlert: 'Into the light', doneSub: 'Every step a note of her song.',
    win: { title: 'She reached the light', line: '“…be able to make the great music that they make.” — David Pinto, Academy of Music for the Blind' },
    lose: { title: 'Keep climbing', line: '“Most of all, I want to serve them.” — David Pinto, Academy of Music for the Blind' },
  },
};
