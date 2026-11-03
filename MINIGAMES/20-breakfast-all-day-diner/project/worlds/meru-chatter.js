// MERU — two pairs of foxes who talk to each other, not to you: two fisherfoxes on the lake shore and two ladies
// outside Meru Lanes. Each pair trades its recorded lines back and forth (A, B, A, B…), voiced through a spatial
// panner at the speaker's head (listener = camera), with a rest between rounds. Recordings in MERU/audio/.
// No text came with the recordings, so there are no captions; the speaker's mouth/mood shows who is talking.
const S = 80 / 2880, AX = a => (a - 1440) * S, AZ = a => (a - 810) * S;
const lake = (px, py) => [AX(px + 600), AZ(py + 1620)];
export const PAIRS = [
  { key: 'fish', zone: 'meruLake', rest: 14,
    clips: ['MERU/audio/talk-fish1.mp3', 'MERU/audio/talk-fish2.mp3', 'MERU/audio/talk-fish3.mp3', 'MERU/audio/talk-fish4.mp3'],
    people: [
      { key: 'fisherfox1', name: 'Fisherfox', role: 'The Lake', outfit: 'vest', torso: ['#9fb7c9', '#5f7d96', '#2d4458'], crest: '8', at: lake(2060, 800), mood: 'warm', rod: true },
      { key: 'fisherfox2', name: 'Fisherfox', role: 'The Lake', outfit: 'coat', torso: ['#c9a66b', '#94713e', '#5a4122'], crest: '8', at: lake(2190, 790), mood: 'happy', rod: true },
    ] },
  { key: 'bowl', zone: 'meruTown', rest: 18,
    clips: ['MERU/audio/talk-bowling1.mp3', 'MERU/audio/talk-bowling2.mp3'],
    people: [
      { key: 'bowlerLady1', name: 'Bowler', role: 'Meru Lanes', outfit: 'dress', female: true, torso: ['#f4a6c0', '#d0668c', '#7a2e4a'], crest: 'M', at: [AX(2105), AZ(1128)], mood: 'happy' },
      { key: 'bowlerLady2', name: 'Bowler', role: 'Meru Lanes', outfit: 'vest', female: true, torso: ['#a8d8c8', '#5aa48c', '#2a5e4e'], crest: 'M', at: [AX(2205), AZ(1128)], mood: 'warm' },
    ] },
];
// they face each other; the fisherfoxes half-turn to the water (south), the ladies half-turn to the square (north)
for (const P of PAIRS) { const [a, b] = P.people; const ang = Math.atan2(b.at[0] - a.at[0], b.at[1] - a.at[1]), k = P.key === 'fish' ? 0.75 : -0.6; a.face = ang + k; b.face = ang + Math.PI - k; }

export function createChatter({ THREE, audio, npcs, M, toon }) {
  const pairs = PAIRS.map(P => {
    const who = P.people.map(p => npcs.find(n => n.key === p.key));
    // fishing rods for the fisherfoxes: a pole + line held out toward the water
    P.people.forEach((p, i) => { if (!p.rod || !who[i]) return; const arm = who[i].c.userData.P && who[i].c.userData.P.arms[1]; if (!arm) return;
      const g = new THREE.Group(); g.position.set(0, -0.42, 0.06); g.rotation.set(1.1, 0, 0); arm.add(g);
      M(new THREE.CylinderGeometry(0.015, 0.025, 2.0, 6), toon('#5a3d2b'), 0, -1.0, 0, g, 0.008, 0.025);
      const line = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.8, 3), new THREE.MeshBasicMaterial({ color: 0xe8eef2 })); line.position.set(0, -2.0, -0.85); line.rotation.x = 1.1; g.add(line);
      who[i].c.userData.P.arms[1].rotation.x = -0.9; who[i].holdArm = -0.9; });
    return { P, who, i: 0, el: null, src: null, panner: null, gain: null, wait: 2 + Math.random() * 4, playing: false, failed: 0 };
  });
  function setup(p) {
    const ctx = audio.ctx; if (!ctx || p.panner) return;
    p.panner = ctx.createPanner(); Object.assign(p.panner, { panningModel: 'HRTF', distanceModel: 'inverse', refDistance: 2.2, maxDistance: 30, rolloffFactor: 1.8 });
    p.gain = ctx.createGain(); p.gain.gain.value = 0; p.gain.connect(p.panner); p.panner.connect(audio.master);
    p.el = new Audio(); p.el.preload = 'auto'; p.el.crossOrigin = 'anonymous';
    try { p.src = ctx.createMediaElementSource(p.el); p.src.connect(p.gain); } catch (e) { p.failed = 99; }
    p.el.addEventListener('ended', () => { p.playing = false; p.i++; p.wait = p.i % p.P.clips.length === 0 ? p.P.rest : 0.35 + Math.random() * 0.4; });
    p.el.addEventListener('error', () => { p.playing = false; p.failed++; p.i++; p.wait = 3; });
  }
  return {
    update(dt, Pl, camera, muted, outdoors) {
      const ctx = audio.ctx;
      for (const p of pairs) {
        const [a, b] = p.who; if (!a || !b) continue;
        const cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2, d = Math.hypot(Pl.x - cx, Pl.z - cz), audible = outdoors && d < 32;
        const sp = p.who[p.i % 2], other = p.who[(p.i + 1) % 2];
        // mouths: the speaker talks, the listener nods along
        sp.c.userData.lineMood = p.playing ? 'excited' : null; other.c.userData.lineMood = null;
        sp.talking = p.playing; other.talking = false;
        for (const w of p.who) if (w.holdArm != null) w.c.userData.P.arms[1].rotation.x = w.holdArm;
        if (!ctx) continue; if (!p.panner) setup(p); if (!p.panner || p.failed > 6) continue;
        const hy = sp.c.position.y + 1.6;
        if (p.panner.positionX) { p.panner.positionX.value = sp.x; p.panner.positionY.value = hy; p.panner.positionZ.value = sp.z; } else p.panner.setPosition(sp.x, hy, sp.z);
        p.gain.gain.setTargetAtTime(muted || !audible ? 0 : 1, ctx.currentTime, 0.2);
        if (!audible) { if (p.playing) { p.el.pause(); } continue; }
        if (p.playing && p.el.paused) p.el.play().catch(() => {});
        if (!p.playing) { p.wait -= dt; if (p.wait <= 0) { p.el.src = p.P.clips[p.i % p.P.clips.length]; p.playing = true; p.el.play().catch(() => { p.playing = false; p.wait = 2; }); } }
      }
    },
  };
}
