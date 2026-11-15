// ART SHIRT PRINTS for the gallery fox rig. The gallery's own print rules (gallery-game.js frontArt / wrapArt / sleeveArt / backLogo), as one small module,
// so the avatar workshop and the new shirt studio print a shirt exactly as the gallery does. No gallery file is changed.
//   const prints = artPrints({ THREE, base });      base = the URL of the gallery's 3D/ folder (ends with a slash)
//   await prints.list() → [{ key, url, thumb, title }]   every painting that can go on a shirt, WALK THROUGH FEAR first. key = the gallery's own key ('gallery/img/wix_….webp').
//   prints.shirtDef(kind, key, chair) → what to lay over a makeFox() def: { outfit, torso, crest, prints }.  kind = 'wrap' | 'wraptee' | 'suit' (ART_SHIRTS)
//   prints.front(key) 512 × 512 · prints.wrap(key) 1024 × 512 · prints.sleeve(key, side) 256 × 512 · prints.logo() 640 × 640 (the BCP logo)
// THE RULES (kept as the gallery has them)
//   ALL-OVER TEE / SWEATSHIRT body: the painting across the front half, mirrored out to both sides, so it meets itself at the back with no seam line.
//   SLEEVES: a strip just inside the painting's left / right edge (26 % wide, 6 % in: the very edge is often dark and reads as a missing sleeve), stretched down the arm and mirrored.
//   ART SUIT (Ben, 13 Nov): the painting as a SQUARE on the chest (a 14 px light border; the print is as wide as the old back print, 1.6 rad, and stops above the belt), the BLIND CANVAS PROJECT LOGO across the back. Sweep the tail aside (look.tailSide 1.15; 1.75 in the chair) so the back shows.
//   A texture is handed back at once and fills in when its picture has loaded.
export const ART_SHIRTS = [['own', 'OWN OUTFIT'], ['wrap', 'ART SWEATSHIRT'], ['wraptee', 'ART TEE'], ['suit', 'ART SUIT']];
export const DEFAULT_ART = 'gallery/img/wix_walk_through_fear.webp', SUIT_BACK_ART = 'gallery/img/wix_curating_hope.webp', LOGO = 'gallery/img/bcp_logo_white.webp';
export const ART_FALLBACK = ["alayna_coaster","alayna_hair","alayna_music","almost_blindness","am_familytree","am_roads","am_sisterhood","amb_11","amb_22","amb_33","anthony_button","anthony_light","anthony_onelove","b_bicycle","b_bridge","b_bus","c_lighthouse","c_motorcycle","c_poles","curating_hope","d_1","d_2","d_3","deborah_diffway","deborah_livebeauty","deborah_raisedup","deja_family","deja_fashion","deja_joyride","delric_blurry","delric_place","delric_temp","doreen_invisibility","doreen_metamorphosis","doreen_unstoppable","m_bridge","m_communication","m_rhapsody","mike_comfort","mike_comic","mike_spectrum","morten_grayzone","morten_innerpeace","morten_mirror","nikki_fellowship","nikki_needle","nikki_selfworth","raquel_11","raquel_22","raquel_33","rusty_reach","rusty_reason","rusty_reliroo","sophia_collab","sophia_meeting","sophia_travel","steven_heart","steven_time","steven_village","walk_through_fear","wayne_napkins","wayne_robot","wayne_trumpet","will_community","will_drums","will_stuck"];   // used when gallery/img.index.json cannot be read
export function artPrints({ THREE, base = '' }) {
  const cache = new Map();
  const tex = (id, w, h, url, draw) => { if (cache.has(id)) return cache.get(id); const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'), t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const img = new Image(); img.onload = () => { draw(c, w, h, img); t.needsUpdate = true; }; img.src = base + url; cache.set(id, t); return t; };
  const front = key => tex('f|' + key, 512, 512, key, (c, w, h, img) => { c.fillStyle = '#f3f2f2'; c.fillRect(0, 0, w, h); c.drawImage(img, 14, 14, w - 28, h - 28); });
  // the suit's chest print: the kit's front panel is taller than it is wide, so the painting fills only its top 83 % (the rest stays clear = jacket), which reads as a square
  const chest = key => tex('c|' + key, 512, 512, key, (c, w, h, img) => { const ah = Math.round(h * 0.83); c.clearRect(0, 0, w, h); c.fillStyle = '#f3f2f2'; c.fillRect(0, 0, w, ah); c.drawImage(img, 14, 14, w - 28, ah - 28); });
  const wrap = key => tex('w|' + key, 1024, 512, key, (c, w, h, img) => {
    c.save(); c.translate(w, 0); c.scale(-1, 1);   // the shirt's lathe runs the other way round: flip so the picture reads left to right from the front
    c.drawImage(img, 256, 0, 512, 512);
    c.save(); c.translate(256, 0); c.scale(-1, 1); c.drawImage(img, 0, 0, 512, 512); c.restore();     // mirrored out to one side
    c.save(); c.translate(1280, 0); c.scale(-1, 1); c.drawImage(img, 0, 0, 512, 512); c.restore();    // and to the other: they meet at the back
    c.restore(); });
  // wrapTrue: the same print WITHOUT the outer flip. By the lathe's own math (x = r sin phi, u = phi) the painting then reads left to right from the front; wrap() above is the gallery's version as it stands.
  const wrapTrue = key => tex('t|' + key, 1024, 512, key, (c, w, h, img) => { c.drawImage(img, 256, 0, 512, 512);
    c.save(); c.translate(256, 0); c.scale(-1, 1); c.drawImage(img, 0, 0, 512, 512); c.restore(); c.save(); c.translate(1280, 0); c.scale(-1, 1); c.drawImage(img, 0, 0, 512, 512); c.restore(); });
  const sleeve = (key, side) => tex('s|' + key + '|' + side, 256, 512, key, (c, w, h, img) => { const sw = img.width * 0.26, sx = side < 0 ? img.width * 0.06 : img.width * 0.68;
    c.drawImage(img, sx, 0, sw, img.height, 0, 0, w / 2, h); c.save(); c.translate(w, 0); c.scale(-1, 1); c.drawImage(img, sx, 0, sw, img.height, 0, 0, w / 2, h); c.restore(); });
  const logo = () => tex('logo', 640, 640, LOGO, (c, w, h, img) => { c.clearRect(0, 0, w, h); const lw = 600, lh = lw * img.height / img.width; c.drawImage(img, (w - lw) / 2, (h - lh) / 2, lw, lh); });
  async function list() {
    let names = null; try { const r = await fetch(base + 'gallery/img.index.json'); if (r.ok) names = Object.keys(await r.json()).filter(k => /\/wix_/.test(k)).map(k => k.replace(/^.*\/wix_|\.webp$/g, '')); } catch (e) {}
    if (!names || !names.length) names = ART_FALLBACK;
    const out = names.map(n => ({ key: 'gallery/img/wix_' + n + '.webp', url: base + 'gallery/img/wix_' + n + '.webp', thumb: base + 'gallery/img-s/wix_' + n + '.webp', title: n.replace(/_/g, ' ') }));
    out.sort((a, b) => (b.key === DEFAULT_ART) - (a.key === DEFAULT_ART)); return out;
  }
  function shirtDef(kind, key = DEFAULT_ART, chair = false) {
    if (kind === 'suit') return { outfit: 'suit', torso: ['#2a2e34', '#1a1d22', '#0c0e10'], crest: 'none', prints: { front: chest(key), frontW: 1.6, back: logo() } };
    if (kind === 'wrap' || kind === 'wraptee') return { outfit: 'tee', torso: ['#141414', '#141414', '#0c0c0c'], crest: 'none', prints: { wrap: wrap(key), sleeves: [sleeve(key, -1), sleeve(key, 1)], short: kind === 'wraptee', tee: '#141414' } };
    return null;
  }
  return { list, shirtDef, front, chest, wrap, wrapTrue, sleeve, logo };
}
