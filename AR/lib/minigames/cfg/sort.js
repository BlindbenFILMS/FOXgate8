// SORT games: settings for each painting (see engines/sort.js for what each setting means).
// Every card is short, accurate and respectful; `why` is the one line shown and spoken after a wrong answer.
export default {
  // Alayna's portrait: blindness is part of her, like her brown hair. Sort myths from facts about blindness.
  'i-am-blind-like-my-hair-is-brown': {
    engine: 'sort', title: 'Like my hair is brown', kicker: 'Myth or fact',
    how: 'A card about blindness appears over Alayna. Is it a myth or a fact? Sort it before the bar runs out.',
    sides: [{ name: 'Myth', color: '#000', note: 294 }, { name: 'Fact', color: '#6b3a1f', bar: '#f2b33d', note: 587 }],
    card: [0.525, 0.555], cardW: 0.45, tags: [[0.385, 0.752], [0.665, 0.752]], tagW: 0.2, ask: 'Myth or fact?', accent: '#f2b33d',
    color: '#f2b33d', voice: 'warm', count: 11, time: 4.5, perChar: 0.05,
    cards: [
      { t: 'Most blind people see nothing at all.', a: 0, why: 'Most blind people have some sight, like light, shapes or colour.' },
      { t: 'Alayna says being blind is part of her, like her brown hair.', a: 1, why: 'It is a part of her she really appreciates.' },
      { t: 'Blind people can’t use smartphones.', a: 0, why: 'Screen readers speak everything on the screen out loud.' },
      { t: 'Braille is read by touch, with raised dots.', a: 1, why: 'Fingers read patterns of raised dots on the page.' },
      { t: 'Every blind person reads braille.', a: 0, why: 'Many use audio, large print or screen readers instead.' },
      { t: 'A white cane helps a person find steps and kerbs.', a: 1, why: 'The cane finds what is ahead, so the person can move with confidence.' },
      { t: 'A guide dog decides where to go.', a: 0, why: 'The person gives directions. The dog keeps them safe on the way.' },
      { t: 'Blind people can’t make art.', a: 0, why: 'Blind and low-vision artists paint, sculpt, take photos and make music.' },
      { t: 'Blind athletes play sports like goalball and running.', a: 1, why: 'Goalball is a Paralympic sport, and runners can race with a guide.' },
      { t: 'Blind people work as teachers, lawyers and coders.', a: 1, why: 'Blind people work, raise families and lead in many fields.' },
      { t: 'You should talk louder to a blind person.', a: 0, why: 'Blindness is about sight, not hearing. Your normal voice is fine.' },
      { t: 'It’s good to ask before you help a blind person.', a: 1, why: 'Ask first. They will tell you what helps.' },
      { t: 'It’s fine to say “see you later” to a blind person.', a: 1, why: 'Most blind people use words like see and look every day.' },
    ],
    win: { title: 'That’s a part of me', line: '“I am blind like my hair is brown, you know? It’s just a part of me that I really appreciate.” — Alayna Lopez' },
    lose: { title: 'Sort it again', line: '“Lean on your people, but just know no matter where you go, that person you are and always have been is still going to be there.” — Alayna Lopez' },
  },

  // Morten meets himself in a cracked mirror. Sort cracked reflections (untrue, harsh views) from honest ones.
  'the-mirror': {
    engine: 'sort', title: 'Meet the man in the mirror', kicker: 'Cracked or honest',
    how: 'Each card is something you might see in the mirror. Is it a cracked reflection that isn’t true, or an honest one? Sort it.',
    sides: [{ name: 'Cracked', color: '#3b4a2a', bar: '#c9b07a', note: 392 }, { name: 'Honest', color: '#1f4fd8', bar: '#fff', note: 784 }],
    card: [0.525, 0.55], cardW: 0.45, tags: [[0.385, 0.752], [0.665, 0.752]], tagW: 0.2, ask: 'Cracked or honest?', accent: '#7fb4ff',
    color: '#bfe3ff', voice: 'glass', count: 11, time: 5, perChar: 0.05,
    cards: [
      { t: 'If my sight changes, I stop being me.', a: 0, why: 'Your sight can change. You are still you.' },
      { t: 'Morten chose who to become because of his diagnosis.', a: 1, why: 'He chose it because of it, not in spite of it.' },
      { t: 'Meeting yourself honestly can be the hardest part.', a: 1, why: 'Morten says that was the hardest part for him.' },
      { t: 'If you can see a little, you aren’t really blind.', a: 0, why: 'Blindness is a spectrum. Most blind people have some sight.' },
      { t: 'Only people who see nothing use a white cane.', a: 0, why: 'Many people with some sight use a cane too.' },
      { t: 'Asking for help means I failed.', a: 0, why: 'Everyone leans on people and tools. Asking is a skill.' },
      { t: 'Feeling sad about changing sight is okay.', a: 1, why: 'Those feelings are normal, and they can change with time.' },
      { t: 'Most phones have zoom and a voice that reads the screen.', a: 1, why: 'Magnifiers and screen readers come built in.' },
      { t: 'Low-vision training teaches new ways to read, cook and travel.', a: 1, why: 'Vision rehab teaches skills and tools for daily life.' },
      { t: 'A life with less sight can’t be a full life.', a: 0, why: 'Blind people work, travel, love and make art.' },
      { t: 'Big print and strong contrast can make reading easier.', a: 1, why: 'Many people with low vision use both every day.' },
      { t: 'I should hide my sight loss from everyone.', a: 0, why: 'Sharing it can help the people around you help you.' },
    ],
    win: { title: 'You met yourself honestly', line: '“…choosing who I wanted to become because of it, not in spite of it.” — Morten Bonde' },
    lose: { title: 'Look again', line: '“The hardest part was meeting myself honestly — facing the man in the mirror…” — Morten Bonde' },
  },

  // Will's bridge between the calm blue known and the fiery unknown. Sort what is known from what is unknown.
  'decision-divide': {
    engine: 'sort', title: 'Cross the divide', kicker: 'Known or unknown',
    how: 'Will stands on the bridge. Send what is known to the calm blue side, and what is unknown to the fiery side.',
    sides: [{ name: 'Known', color: '#1d3f6e', bar: '#9cc8ff', note: 330 }, { name: 'Unknown', color: '#b8320f', bar: '#ffc23d', note: 220 }],
    card: [0.5, 0.55], cardW: 0.44, tags: [[0.36, 0.752], [0.64, 0.752]], tagW: 0.2, ask: 'Known or unknown?', accent: '#ffc23d',
    color: '#ffb347', voice: 'fire', count: 11, time: 4, perChar: 0.045,
    cards: [
      { t: 'Will’s vision looks pretty stable right now.', a: 0, why: 'His doctors told him nothing has really changed.' },
      { t: '“Nothing’s really changed.”', a: 0, why: 'That is how Will describes his sight today.' },
      { t: 'Whether surgery would improve his sight.', a: 1, why: 'It could help a lot. Nobody can promise it will.' },
      { t: 'Whether surgery could leave him fully blind.', a: 1, why: 'That is a risk, not a certainty.' },
      { t: 'His doctors offered him cataract surgery.', a: 0, why: 'It is a real option they told him about.' },
      { t: 'His doctors are hesitant about it.', a: 0, why: 'They told him so, and he understands why.' },
      { t: 'The cool, calm blue side of the painting.', a: 0, why: 'The blue side is the familiar comfort of now.' },
      { t: 'The fiery orange and red side of the painting.', a: 1, why: 'The fire is the unpredictable outcome.' },
      { t: 'What lies at the far end of the bridge.', a: 1, why: 'The bridge is a path of no return into the unknown.' },
      { t: 'The path Will has already walked.', a: 0, why: 'What is behind him is familiar ground.' },
      { t: 'Which way Will will choose.', a: 1, why: 'The choice is still his to make.' },
      { t: 'Will knows his eyes are nearsighted today.', a: 0, why: 'Surgery might remove his nearsightedness, but that part is unknown.' },
    ],
    win: { title: 'You crossed the divide', line: '“It’s looking pretty stable, nothing’s really changed…” — Will Hollimon' },
    lose: { title: 'Back to the bridge', line: '“…they’re just very hesitant on what to do about it. And I get why—” — Will Hollimon' },
  },
};
