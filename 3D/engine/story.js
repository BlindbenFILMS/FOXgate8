// Quests, quest steps and dialogue choices as data.
//
// QUEST: { title, allDone, steps: [{ id, text, at, who, done, or, count:{flags,of} }] }
// The current step follows the 2D guide's rule: find the LAST done step, then the first
// unfinished one after it (so arriving out of order still reads right).
//
// CONVERSATION TREE: { start: 'root', nodes: { id: { lines: [{ who:'npc'|'player', text, mood }],
//   choices: [{ text, go: 'nodeId', end: true, if: flagReq, set: 'flag' | ['a','b'], do: 'action', once: true }], next: 'nodeId' } } }
// branch(lines, choices) builds the 2D game's 'lines + [{label, replies, set, do}]' talks.
// A choice's text is said by the player as the first line of its branch.

const list = v => v == null ? [] : Array.isArray(v) ? v : [v];

export function questStep(quest, test) {
  const steps = quest.steps || []; const done = s => [s.done, ...list(s.or)].filter(Boolean).some(r => test(r));
  let last = -1; steps.forEach((s, i) => { if (done(s)) last = i; });
  for (let i = last + 1; i < steps.length; i++) if (!done(steps[i])) return steps[i];
  return null;
}
export function questStepText(step, test) {
  if (!step) return ''; let t = String(step.text || '');
  if (step.count && step.count.flags) t += ' (' + step.count.flags.filter(f => test(f)).length + '/' + step.count.of + ')';
  return t;
}
export function questBanner(quest, test) {
  const s = questStep(quest, test);
  return { title: quest.title, text: s ? questStepText(s, test) : quest.allDone, at: s ? s.at : null, who: s ? s.who : null, done: !s };
}

// Old linear scripts ([{who,text}...]: each player line is a question, the npc lines after it the answer)
// become a hub of choices. Nothing is reworded.
export function treeFromLinear(lines, { bye = 'Goodbye.' } = {}) {
  const nodes = { root: { lines: [], choices: [] } }; let cur = null, n = 0;
  for (const l of lines) {
    if (l.who === 'player') { const id = 'q' + (n++); nodes[id] = { lines: [], next: 'root' }; nodes.root.choices.push({ text: l.text, go: id }); cur = nodes[id]; }
    else if (cur) cur.lines.push({ who: 'npc', text: l.text, mood: l.mood });
    else nodes.root.lines.push({ who: 'npc', text: l.text, mood: l.mood });
  }
  nodes.root.choices.push({ text: bye, end: true, bye: true });
  return { start: 'root', nodes };
}

export class Conversation {
  constructor(tree, { test = () => false, set = () => {}, act = null, asked } = {}) {
    this.tree = tree; this.test = test; this.set = set; this.act = act; this.asked = asked || new Set(); this.node = tree.nodes[tree.start || 'root']; this.ended = false;
  }
  // lines to play now (for the node just entered)
  lines() { return this.node ? this.node.lines || [] : []; }
  // after lines finish: the menu, or null when the talk is over
  options() {
    const nd = this.node; if (!nd) return null;
    if (!nd.choices && nd.next) { this.node = this.tree.nodes[nd.next]; return this.lines().length ? 'lines' : this.options(); }
    const ch = (nd.choices || []).map((c, i) => ({ ...c, i })).filter(c => (c.if == null || this.test(c.if)) && !(c.once && this.asked.has(c.go)));
    return ch.length ? ch.map(c => ({ text: c.text, i: c.i, asked: !!c.go && this.asked.has(c.go), bye: !!c.end })) : null;
  }
  // returns the new lines (player's question first), or null when the choice ends the talk
  choose(i) {
    const c = (this.node.choices || [])[i]; if (!c) return null;
    list(c.set).forEach(f => this.set(f)); if (c.do && this.act) this.act(c.do);
    if (c.end) { this.ended = true; return null; }
    this.asked.add(c.go); this.node = this.tree.nodes[c.go];
    return [{ who: 'player', text: c.text }, ...this.lines()];
  }
}

// The 2D game's openCaveDialogue(npc, lines, onClose, [{ label, replies, action }]) as a tree.
export function branch(lines, choices = []) {
  const nodes = { root: { lines, choices: [] } };
  choices.forEach((c, i) => { const id = 'b' + i; nodes[id] = { lines: (c.replies || []).map(t => ({ who: 'npc', text: t })) }; nodes.root.choices.push({ text: c.label, go: id, set: c.set, do: c.do }); });
  if (!choices.length) delete nodes.root.choices;
  return { start: 'root', nodes };
}
