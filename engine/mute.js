// s721 GLOBAL MUTE (Ben: mute while Claude works so previews don't bleed sound). Plain script, loads first in <helmet>.
// MUTED by default in Claude's preview only (s731: the GitHub site + local play are always ON). Unmute here: add ?sound=1 to the URL, or run localStorage.setItem('fg8.sound', '1') once (then reload).
// s722b: contexts stay RUNNING (a suspended context froze the page: code that waits for state 'running' looped forever);
// anything wired to the speakers goes through a silent gain instead.
(function () {
  let on = false;
  try { on = /[?&]sound=1/.test(location.search) || localStorage.getItem('fg8.sound') === '1'; } catch (e) {}
  // s731 (Ben: "no sound anywhere at the GitHub link"): the mute is ONLY for Claude's previews. Real play = sound on: the GitHub site, your own PC (PLAY-MERU.bat / localhost / a file).
  try { if (/github\.io$/i.test(location.hostname) || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:') on = true; } catch (e) {}
  if (/[?&]sound=0/.test(location.search)) on = false;
  window.__fg8Muted = !on;
  if (on) return;
  const AN = window.AudioNode && AudioNode.prototype, conn = AN && AN.connect;
  if (conn) AN.connect = function (dest, ...rest) {
    if (window.AudioDestinationNode && dest instanceof AudioDestinationNode) { const c = dest.context;
      if (!c.__fg8Mute) { c.__fg8Mute = c.createGain(); c.__fg8Mute.gain.value = 0; conn.call(c.__fg8Mute, dest); }
      return conn.call(this, c.__fg8Mute, ...rest); }
    return conn.call(this, dest, ...rest); };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { this.muted = true; return play.call(this); };
  try { if (window.speechSynthesis) window.speechSynthesis.speak = function () {}; } catch (e) {}
})();
