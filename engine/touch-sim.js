// TEST ONLY: ?touch=1 makes matchMedia('(pointer: coarse)') true, so a desktop preview runs the phone code paths (phone budget, phone camera, pad).
(function () { if (!/[?&]touch=1/.test(location.search)) return; const mm = window.matchMedia.bind(window);
  window.matchMedia = q => /pointer\s*:\s*coarse/.test(q) ? { matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } } : mm(q); })();
