// PAINTING GAMES IN THE GALLERY (Ben, 29 Oct). Five paintings have their own Blind Canvas game (made for the AR page,
// AR/lib/minigames/*). Walk up to one, open it (VIEW), and PLAY THE GAME replaces the living puzzle for that painting.
// The game plays right on the painting in the 3D room: the camera squares up in front of it, the fox holds still, the
// gallery's buttons step aside and the room film pauses, and LEAVE THE GAME (or Esc) gives everything back.
// The games themselves are untouched: they live in AR/lib/minigames and are loaded only when someone presses play.
const AR = new URL('../../AR/', import.meta.url).href;            // the 8GATES-SITE/AR folder, beside 3D
const M = (u) => (window.GMEDIA || (x => x))(u);                    // gallery media (films, audio) from the live site when testing
const BEN = 'gallery/video/ben_fox.mp4';
export const GAMES = {
  wix_walk_through_fear: { file: 'walk-through-fear-see.js', fn: 'seeItMyWayGame', name: 'See it my way',
    work: { id: 'walk-through-fear', title: 'Walk Through Fear', artist: 'Ben Fox', image: AR + 'targets/walk-through-fear.jpg',
      quote: '“… when you walk through the fear, you are the only thing that is left.” — Ben Fox', overlay: { anim: 'gallery/anim/wix_walk_through_fear.mp4' } }, story: BEN },
  wix_curating_hope: { file: 'curating-hope-memory.js', fn: 'lightMemoryGame', name: 'Light memory',
    work: { id: 'curating-hope', title: 'Curating Hope', artist: 'Ben Fox', image: AR + 'targets/curating-hope.jpg',
      quote: '“It’s so important to curate hope together — to share it, and to take notice not just of what we’re doing right now, but of the fact that there’s enough human spirit left in us that we’re willing to pause for some things still today. And I am honored to know that blindness is a cause people still pause for.” — Ben Fox',
      overlay: { anim: 'gallery/anim/wix_curating_hope.mp4' } }, story: BEN },
  wix_am_sisterhood: { file: 'reflections-fish.js', fn: 'sistersFishGame', name: 'Fish for the sisters',
    work: { id: 'reflections-of-sisterhood', title: 'Reflections of Sisterhood', artist: 'April & Melissa', image: AR + 'targets/reflections-of-sisterhood.jpg',
      quote: '“… that’s where our parents were from, Guanaja. That’s where we went every summer. It’s a little house and their backyard is water. So, we would sit back there, kick our feet in.” — April & Melissa',
      overlay: { anim: 'gallery/anim/wix_am_sisterhood.mp4', audio: 'gallery/audio/art_10.mp3' } }, story: 'gallery/audio/art_10.mp3' },
  wix_am_familytree: { file: 'roots-apples.js', fn: 'familyApplesGame', name: 'Family apples',
    work: { id: 'roots-of-kinship', title: 'Roots of Kinship', artist: 'April & Melissa', image: AR + 'targets/roots-of-kinship.jpg',
      quote: '“I work side by side with my sister and I love her dearly. We’re now, as a family, cohesively dealing with the same genetic disease. So you get through it — life is on the other side. It’s different, but you can live a fulfilled life.” — April & Melissa',
      overlay: { anim: 'gallery/anim/wix_am_familytree.mp4', clip: AR + 'media/clips/roots-of-kinship.mp4' } }, story: AR + 'media/clips/roots-of-kinship.mp4' },
  wix_wayne_napkins: { file: 'napkins.js', fn: 'napkinsGame', name: 'Napkin Please', again: true,
    work: { id: 'napkin-please', title: 'Napkin, Please', artist: 'Wayne Pearcy', image: AR + 'targets/napkin-please.jpg',
      quote: '“One of those stereotypes is blind people are just inadvertently messy eaters and they’re going to need tons of napkins. I’ll ask, can I have some napkins? And they’ll bring me like a whole Bible’s worth of them. And I’m thinking, who do you think I am?” — Wayne Pearcy',
      overlay: { anim: 'gallery/anim/wix_wayne_napkins.mp4' } } },
};
const keyOf = a => { const m = /([^/]+)\.\w+$/.exec((a && a.img) || ''); return m ? m[1] : null; };

export function setupGames({ G, announce = () => {} }) {
  const THREE = G.world.THREE, scene = G.world.scene, camera = G.world.camera, renderer = G.debug.renderer;
  const ink = '#1d1c1b', red = '#ec3013', bg = '#f3f2f2';
  const btnCss = `min-height:48px;padding:0 18px;border:2px solid ${bg};background:${ink};color:${bg};font:800 15px Archivo,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:0`;
  let play = null, cur = null, hidden = [], media = null, ui = null, busy = false;

  // where the painting's picture is: its canvas in the room (the living-painting list knows it, by the animation's name)
  function picture(key, a) {
    const an = G.debug.animator, it = an && an.items.find(i => i.url && i.url.includes('/anim/' + key + '.mp4')), m = it && it.mesh && it.mesh();
    if (m && m.parent) { m.updateMatrixWorld(true); const q = m.getWorldQuaternion(new THREE.Quaternion()), n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
      return { center: m.getWorldPosition(new THREE.Vector3()).addScaledVector(n, 0.036), normal: n, width: it.w, height: it.h }; }
    if (a && a.ctr) { const n = (a.n && a.n.lengthSq() > 0.5 ? a.n.clone() : new THREE.Vector3(0, 0, 1)).setY(0).normalize(); return { center: a.ctr.clone(), normal: n, width: 2, height: 2 }; }
    return null;
  }
  function frontView(P) {
    const fov = THREE.MathUtils.degToRad(camera.fov), fitH = P.height * 1.35 / 2 / Math.tan(fov / 2), fitW = P.width * 1.15 / 2 / Math.tan(fov / 2) / camera.aspect;
    return P.center.clone().addScaledVector(P.normal, Math.max(fitH, fitW, 1.2));
  }
  function shoot() { if (!cur) return; const pos = frontView(cur.P); if (G.camShot) G.camShot(pos.toArray(), cur.P.center.toArray()); }
  function stopMedia() { if (media) { try { media.pause(); } catch (e) {} if (media.remove) media.remove(); media = null; } }
  function story(src) {   // the artist's own interview, over the game (tap ✕ or let it end)
    stopMedia(); const url = /^https?:/.test(src) ? src : M(src);
    if (/\.mp4$/.test(src)) { const v = Object.assign(document.createElement('video'), { src: url, controls: true, playsInline: true, autoplay: true });
      v.style.cssText = 'position:fixed;inset:8% 4%;width:92%;height:84%;z-index:40;background:#000;border:2px solid #f3f2f2'; v.onended = stopMedia; document.body.appendChild(v); media = v; v.play().catch(() => {}); }
    else { media = new Audio(url); media.play().catch(() => {}); }
  }
  function bar(over) {   // our two buttons, bottom-left, out of the game's way: LEAVE always, PLAY AGAIN when a run is over
    if (!ui) { ui = document.createElement('div'); ui.setAttribute('role', 'group'); ui.setAttribute('aria-label', 'Game'); ui.style.cssText = 'position:fixed;z-index:12;left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));display:flex;gap:8px;flex-wrap:wrap'; document.body.appendChild(ui); }
    ui.innerHTML = '';
    if (over && cur && cur.g.again) { const b = document.createElement('button'); b.textContent = 'Play again'; b.style.cssText = btnCss + `;background:${red};border-color:${red}`; b.onclick = () => { if (play) { play.restart(); bar(false); } }; ui.appendChild(b); }
    const l = document.createElement('button'); l.textContent = over ? 'Leave the game' : '✕ Leave'; l.style.cssText = btnCss + (over && !(cur && cur.g.again) ? `;background:${red};border-color:${red}` : ''); l.onclick = leave; ui.appendChild(l);
    if (over) l.focus();
  }
  async function start(a, key) {
    if (busy || play) return; const g = GAMES[key]; if (!g) return; busy = true;
    const P = picture(key, a); if (!P) { busy = false; announce('Walk a little closer to the painting, then try again.'); return; }
    let mods; try { mods = await Promise.all([import(AR + 'lib/minigames/in-world.js'), import(AR + 'lib/minigames/' + g.file)]); }
    catch (e) { busy = false; console.warn('game', e); announce('Sorry, the game didn’t load. Try again in a moment.'); return; }
    const pc = document.getElementById('px'); if (pc && pc.click) try { pc.click(); } catch (e) {}   // close the VIEW ART panel
    if (window.PUZZLE && window.PUZZLE.isOpen && window.PUZZLE.isOpen()) window.PUZZLE.close();
    cur = { g, key, P }; window.HUSH = true; if (G.hold) G.hold(true);
    // the gallery's own buttons step aside (everything on the page but the 3D view); the game brings its own
    hidden = [...document.body.children].filter(el => el.id !== 'stage' && !/^(SCRIPT|STYLE|LINK)$/.test(el.tagName) && el.style.visibility !== 'hidden');
    for (const el of hidden) { el.dataset.gameVis = el.style.visibility || ''; el.style.visibility = 'hidden'; }
    if (G.camSave) G.camSave(); shoot();
    const work = { ...g.work, overlay: { ...g.work.overlay, anim: M(g.work.overlay.anim) } };
    try {
      play = mods[0].playOnPainting({ make: mods[1][g.fn], scene, camera, renderer, ...P, work,
        say: t => { try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(t)); } catch (e) {} },
        buzz: p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} },
        story: () => g.story ? story(g.story) : null,
        onEnd: () => bar(true) });
    } catch (e) { console.warn('game', e); busy = false; leave(); announce('Sorry, the game didn’t start.'); return; }
    busy = false; bar(false); announce(g.name + ', the game for ' + g.work.title + '. Leave the game any time with the Leave button or Escape.');
  }
  function leave() {
    if (play) { try { play.stop(); } catch (e) {} play = null; }
    stopMedia(); try { speechSynthesis.cancel(); } catch (e) {}
    if (ui) { ui.remove(); ui = null; }
    for (const el of hidden) { el.style.visibility = el.dataset.gameVis || ''; delete el.dataset.gameVis; } hidden = [];
    if (cur) { cur = null; if (G.hold) G.hold(false); window.HUSH = false; if (G.camRelease) G.camRelease(); }
  }
  G.world.onTick(dt => { if (play) try { play.update(Math.min(0.1, dt || 0.016)); } catch (e) { console.warn('game', e); } });
  addEventListener('keydown', e => { if (cur && e.key === 'Escape') leave(); });
  addEventListener('resize', () => { if (cur) shoot(); });
  // in the VIEW ART panel: PLAY THE GAME, in place of the living puzzle, for the paintings that have a game
  function button(a, host) {
    const key = keyOf(a); if (!GAMES[key] || !host) return false; if (host.querySelector('[data-game]')) return true;
    const b = document.createElement('button'); b.dataset.game = '1'; b.textContent = 'PLAY THE GAME · ' + GAMES[key].name.toUpperCase() + ' →';
    b.style.cssText = `min-height:48px;padding:0 14px;border:2px solid ${red};background:${red};color:#fff;font:700 15px Archivo,sans-serif;text-align:left;letter-spacing:.04em;cursor:pointer;border-radius:0;margin:12px 0;width:100%`;
    b.onclick = () => start(a, key); host.prepend(b); return true;
  }
  return { button, start, leave, has: a => !!GAMES[keyOf(a)], isOn: () => !!cur, get play() { return play; } };
}
