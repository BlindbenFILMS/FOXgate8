// MUTE ALL (Ben, s104f: "mute the audio for now"). Loaded first by FOXGATE8-PLAYABLE (+ the in-world games it mounts).
// Every Web Audio context starts suspended and never resumes, every <audio>/<video> plays muted. ?sound=1 brings sound back.
(function () { if (/[?&]sound=1/.test(location.search) || window.__8gMuted) return;   /* s179 Ben: muted again (?sound=1 = sound on) */ window.__8gMuted = true;
  for (const k of ['AudioContext', 'webkitAudioContext']) { const AC = window[k]; if (!AC) continue;
    const M = function (...a) { const c = new AC(...a); try { c.suspend(); } catch (e) {} c.resume = () => Promise.resolve(); return c; };
    M.prototype = AC.prototype; window[k] = M; }
  const mp = HTMLMediaElement.prototype, play = mp.play; mp.play = function () { this.muted = true; return play.call(this); };
  // minigame iframes (same origin): mute each one when it loads (one capture listener, no DOM observer)
  const src = new URL('engine/mute-all.js', document.baseURI).href;
  addEventListener('load', e => { const f = e.target; if (!f || f.tagName !== 'IFRAME') return; try { const w = f.contentWindow; if (!w || w.__8gMuted || !w.document) return; const s = w.document.createElement('script'); s.src = src; (w.document.head || w.document.documentElement).appendChild(s); } catch (er) {} }, true);
})();
