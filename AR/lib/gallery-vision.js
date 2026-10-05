// Blind Canvas gallery: "See through their eyes" spots.
// Two floor circles in the main hall. Step on one and choose "Stand here": you're held in place, the camera moves to
// your fox's eyes, and Ben's vision-condition filters (from the Patient Experience simulator: RP, cataracts, macular
// degeneration, floaters, glaucoma, with the same severity curves) are laid over the live 3D view.
// Twists for 3D:
//   • the clear spot of vision follows your eyes: it leads a little in the direction you turn, then settles
//   • floaters lag behind your look and drift back, like real ones in the vitreous
//   • stepping on, your sight "settles in" to the chosen severity; stepping off, it clears
//   • Guided look slowly turns your head between the big screen and the paintings around you
// AR copy of 3D/engine/gallery-vision.js. It imports 'three' through the AR page's import map, so it shares
// MindAR's copy of three.js instead of loading a second one. If the 3D original changes, copy it here again
// and redo these two edits (this import, and the 'move your phone' hint in open()).
import * as THREE from 'three';

export const LEARN = {"rp": {"label": "Retinitis Pigmentosa", "common": "Tunnel Vision", "accent": "#5b8def", "effect": "rp", "art": "Clinic examination room", "tagline": "A slow narrowing of the visual field — the world seen through a closing tunnel of light.", "whatIs": "Retinitis Pigmentosa is a family of inherited disorders that gradually break down the light-sensing cells of the retina. The rods and cones stop working over many years, so vision changes slowly rather than all at once — most often beginning at the edges and with difficulty seeing in the dark.", "experience": ["Night blindness — struggling to see in low light long before anything else", "Peripheral vision narrowing inward, like looking through a shrinking tube", "Bumping into things just outside the center of view", "Central, detailed sight often remaining clear far longer"], "living": ["A white cane and orientation training restore confident movement", "High contrast, good lighting, and screen readers keep work open", "Pace and severity vary widely — each person’s road is their own"], "facts": [{"k": "Affects", "v": "~1 in 4,000 people"}, {"k": "Onset", "v": "Childhood to early adulthood"}, {"k": "Cause", "v": "Inherited / genetic"}, {"k": "Progression", "v": "Gradual, over years"}]}, "amd": {"label": "Macular Degeneration", "common": "Central Loss", "accent": "#e0903f", "effect": "amd", "art": "Clinic examination room", "tagline": "The center of sight fades while the edges remain — faces and detail dissolve behind a smudge.", "whatIs": "Macular degeneration affects the macula, the small central part of the retina responsible for sharp, straight-ahead vision. As central detail fades, side (peripheral) vision typically remains, so people navigate while faces and fine print blur.", "experience": ["A blurred, dim, or empty patch in the very center of view", "Straight lines appearing wavy or bent", "Faces becoming hard to recognize while edges stay clear", "Needing more light and contrast to read or see detail"], "living": ["Eccentric viewing — looking slightly to the side — uses healthy retina", "Magnifiers and large-print tools keep reading possible", "Most people keep useful peripheral mobility vision"], "facts": [{"k": "Affects", "v": "Millions, mostly 50+"}, {"k": "Onset", "v": "Usually later in life"}, {"k": "Cause", "v": "Age, genetics, lifestyle"}, {"k": "Pattern", "v": "Central vision first"}]}, "cataracts": {"label": "Cataracts", "common": "Cataracts", "accent": "#d9c24a", "effect": "cataracts", "art": "Clinic examination room", "tagline": "The lens of the eye clouds over — the world washes into a milky, glaring haze.", "whatIs": "A cataract is a clouding of the eye’s normally clear lens. Light scatters as it passes through, so vision turns hazy and washed-out, colors fade, and bright lights bloom into glare. Cataracts are extremely common with age and, unlike most retinal conditions, are usually treatable with surgery.", "experience": ["A cloudy, foggy, or filmy quality over everything", "Colors looking faded, yellowed, or less vivid", "Strong glare and halos around lights, especially at night", "Reduced contrast — detail flattening into haze"], "living": ["Surgery to replace the lens restores clarity for most people", "Anti-glare lenses and good lighting ease daily tasks", "One of the most treatable causes of vision loss"], "facts": [{"k": "Affects", "v": "Very common with age"}, {"k": "Onset", "v": "Typically 60+"}, {"k": "Cause", "v": "Lens proteins clumping"}, {"k": "Treatment", "v": "Surgery, often curative"}]}, "glaucoma": {"label": "Glaucoma", "common": "Glaucoma", "accent": "#7b7bd6", "effect": "glaucoma", "art": "Clinic examination room", "tagline": "Pressure damages the optic nerve — vision quietly erodes from the edges, often unnoticed at first.", "whatIs": "Glaucoma is a group of conditions that damage the optic nerve, frequently linked to raised pressure inside the eye. It typically erodes peripheral vision in irregular patches, closing a soft, foggy frame inward. Because it’s painless and gradual, it can advance silently — which is why regular eye checks matter.", "experience": ["Peripheral vision fading in uneven, blurred patches", "A soft, foggy frame slowly closing inward", "Trouble adjusting in dim light or seeing contrast", "Often no early symptoms — it can go unnoticed"], "living": ["Eye drops and treatment can slow or halt progression", "Early detection through routine screening is key", "Orientation tools support safe movement as fields narrow"], "facts": [{"k": "Affects", "v": "~80 million worldwide"}, {"k": "Onset", "v": "More common after 60"}, {"k": "Cause", "v": "Optic nerve damage"}, {"k": "Key", "v": "Early detection matters"}]}, "dr": {"label": "Diabetic Retinopathy", "common": "Floaters", "accent": "#cf5b41", "effect": "floaters", "art": "Clinic examination room", "tagline": "Diabetes damages the retina’s vessels — drifting floaters, dark spots, and blur cloud the view.", "whatIs": "Diabetic Retinopathy occurs when high blood sugar damages the tiny blood vessels in the retina. They can leak or bleed, casting drifting shadows (floaters), dark spots, and patches of blur across vision. It is a leading cause of vision loss in working-age adults — and largely preventable with blood-sugar control and screening.", "experience": ["Drifting specks, threads, and floaters across the view", "Dark or empty spots where vessels have bled", "Blurred or fluctuating vision day to day", "Trouble with color and night vision as it advances"], "living": ["Managing blood sugar and pressure slows the damage", "Laser treatment and injections can preserve sight", "Annual dilated eye exams catch it before it’s felt"], "facts": [{"k": "Affects", "v": "Many with diabetes"}, {"k": "Onset", "v": "Working-age adults"}, {"k": "Cause", "v": "Vessel damage from diabetes"}, {"k": "Key", "v": "Largely preventable"}]}};

export const CONDITIONS = [
  { id: 'rp', label: 'Retinitis Pigmentosa', chip: 'Tunnel', desc: 'A shrinking tunnel of sight: peripheral vision narrows inward, with early night blindness. (Ben\'s diagnosis.)' },
  { id: 'cataracts', label: 'Cataracts', chip: 'Cataracts', desc: "The eye's lens clouds over: a milky, glaring haze with faded colour and contrast." },
  { id: 'amd', label: 'Macular Degeneration', chip: 'Macular', desc: 'Central vision blurs and darkens: detail vanishes where you look, while the edges linger.' },
  { id: 'floaters', label: 'Floaters', chip: 'Floaters', desc: 'Drifting specks and threads swim across the view, clearest against bright areas. They trail behind as you look around.' },
  { id: 'glaucoma', label: 'Glaucoma', chip: 'Glaucoma', desc: 'Peripheral vision erodes in patches as a soft, foggy frame closes inward.' },
];

// the Patient Experience simulator's own overlay maths (severity s 0..1, gaze in % of the screen)
const FLOATER_SPOTS = [[12, 18, 5], [24, 38, 7], [33, 14, 4], [44, 30, 8], [18, 60, 6], [30, 74, 5], [9, 42, 4.5], [40, 52, 6.5], [52, 20, 5], [58, 44, 8], [66, 24, 4.5], [73, 52, 7], [49, 66, 6], [62, 72, 5], [78, 34, 5.5], [86, 58, 6.5], [88, 22, 4], [70, 12, 4], [22, 86, 5], [54, 86, 6], [82, 80, 5.5], [36, 90, 4.5], [16, 30, 4], [92, 44, 5]];
function simStyle(c, s, gx, gy) {
  const o = { background: 'none', filter: 'none', spots: 'none' };
  if (c === 'rp') {
    const amp = Math.min(1, s * 1.5125), clear = Math.max(3, (1 - amp) * 46 + 4);
    const edge = (0.4 + s * 0.45).toFixed(3), mid = (0.7 + s * 0.28).toFixed(3), wash = (s * 0.42).toFixed(3), dim = (s * 0.3).toFixed(3);
    const dark = `radial-gradient(circle at ${gx}% ${gy}%, rgba(0,0,0,0) ${clear}%, rgba(0,0,0,${edge}) ${clear + 6}%, rgba(0,0,0,${mid}) ${clear + 14}%, rgba(0,0,0,1) ${clear + 21}%)`;
    const washL = `radial-gradient(circle at ${gx}% ${gy}%, rgba(247,243,233,${wash}) 0%, rgba(247,243,233,${(s * 0.22).toFixed(3)}) ${(clear * 0.55).toFixed(1)}%, rgba(247,243,233,0) ${clear}%)`;
    o.background = `${washL}, ${dark}, linear-gradient(rgba(0,0,0,${dim}), rgba(0,0,0,${dim}))`;
    o.filter = `blur(${(s * 2.25).toFixed(2)}px)`;
  } else if (c === 'glaucoma') {
    const amp = Math.min(1, s * 0.52734375), clear = Math.max(2, (1 - amp) * 40 + 3);
    o.background = `radial-gradient(ellipse 64% 64% at ${gx}% ${gy}%, rgba(0,0,0,0) ${clear}%, rgba(16,14,12,0.5) ${clear + 7}%, rgba(0,0,0,0.97) ${clear + 24}%)`;
    o.filter = `blur(${(s * s * 11).toFixed(2)}px)`;
  } else if (c === 'cataracts') {
    o.background = `rgba(228,221,200,${(0.1 + s * 0.4).toFixed(3)})`;
    o.filter = `blur(${(s * 5).toFixed(2)}px) contrast(${(1 - s * 0.35).toFixed(3)}) brightness(${(1 + s * 0.18).toFixed(3)}) sepia(${(s * 0.35).toFixed(3)})`;
  } else if (c === 'amd') {
    const fog = Math.min(1, 0.45 + s * 0.85), r1 = 13 + s * 15, r2 = 28 + s * 28;
    o.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(22,19,15,${(0.98 * fog).toFixed(3)}) 0%, rgba(22,19,15,${(0.9 * fog).toFixed(3)}) ${r1}%, rgba(22,19,15,${(0.5 * fog).toFixed(3)}) ${r2}%, rgba(0,0,0,0) ${r2 + 16}%)`;
    o.filter = `blur(${(1.4 + s * 3.4).toFixed(2)}px)`;
  } else if (c === 'floaters') {
    const op = Math.min(1, s * 0.88), grow = 1 + s * 1.43;
    o.spots = FLOATER_SPOTS.map(([x, y, r0]) => { const r = r0 * grow; return `radial-gradient(circle at ${x}% ${y}%, rgba(6,5,3,${op.toFixed(2)}) 0%, rgba(6,5,3,${(op * 0.78).toFixed(2)}) ${(r * 0.45).toFixed(1)}%, rgba(0,0,0,0) ${r.toFixed(1)}%)`; }).join(',');
    o.filter = `blur(${(s * 3).toFixed(2)}px)`;
  }
  return o;
}

// a floor spot: red ring with the words running round it and an eye in the middle (drawn, no image files)
function spotTexture(label) {
  const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d'), m = S / 2;
  c.fillStyle = 'rgba(29,28,27,0.88)'; c.beginPath(); c.arc(m, m, 500, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#ec3013'; c.lineWidth = 34; c.beginPath(); c.arc(m, m, 470, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#f3f2f2'; c.lineWidth = 6; c.beginPath(); c.arc(m, m, 330, 0, Math.PI * 2); c.stroke();
  // text round the ring
  const text = (' ' + label + ' ·').repeat(2).toUpperCase(); c.fillStyle = '#f3f2f2'; c.font = '800 54px Archivo, Arimo, Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const total = [...text].reduce((a, ch) => a + c.measureText(ch).width, 0), R = 398, scale = (Math.PI * 2 * R * 0.97) / total;
  let ang = -Math.PI / 2;
  for (const ch of text) { const w = c.measureText(ch).width * scale; ang += w / R / 2; c.save(); c.translate(m + Math.cos(ang) * R, m + Math.sin(ang) * R); c.rotate(ang + Math.PI / 2); c.fillText(ch, 0, 0); c.restore(); ang += w / R / 2; }
  // the eye
  c.strokeStyle = '#f3f2f2'; c.lineWidth = 22; c.beginPath(); c.moveTo(m - 210, m); c.quadraticCurveTo(m, m - 190, m + 210, m); c.quadraticCurveTo(m, m + 190, m - 210, m); c.stroke();
  c.fillStyle = '#ec3013'; c.beginPath(); c.arc(m, m, 70, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1d1c1b'; c.beginPath(); c.arc(m, m, 30, 0, Math.PI * 2); c.fill();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildVisionSpots({ scene, spots, groundAt }) {
  const tex = spotTexture('See through their eyes');
  const plateTex = (() => { const cv = document.createElement('canvas'); cv.width = 720; cv.height = 372; const c = cv.getContext('2d');
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, 720, 372); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 720, 12);
    const F = 'Archivo, Arimo, Helvetica, Arial, sans-serif'; c.fillStyle = '#ff9783'; c.font = `800 30px ${F}`; c.fillText('VISION SIMULATOR', 40, 70);
    c.fillStyle = '#ffffff'; c.font = `800 58px ${F}`; c.fillText('See through', 40, 140); c.fillText('their eyes', 40, 200);
    c.fillStyle = '#e9e5e5'; c.font = `700 28px ${F}`; c.fillText('STEP ON THE CIRCLE \u00b7 STAND HERE', 40, 266);
    c.fillStyle = '#ec3013'; c.font = `800 28px ${F}`; c.fillText('CLICK/DRAG SCREEN TO LOOK AROUND', 40, 318);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
  const out = [], signG = new THREE.Group(); scene.add(signG);
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), faceM = new THREE.MeshBasicMaterial({ map: tex, transparent: true }), plateM = new THREE.MeshBasicMaterial({ map: plateTex });   // shared, so the signs merge
  for (const sp of spots) {
    const y = groundAt(sp.x, sp.y + 1, sp.z); const yy = y > -100 ? y : sp.y;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    disc.rotation.x = -Math.PI / 2; disc.rotation.z = sp.textYaw || 0; disc.position.set(sp.x, yy + 0.015, sp.z); disc.renderOrder = 2; scene.add(disc);
    const glow = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.3, 64), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.5, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.set(sp.x, yy + 0.012, sp.z); scene.add(glow);
    // a little sign on a pole beside the circle: the same eye logo, and what to do
    if (sp.look) {
      let dx = sp.look[0] - sp.x, dz = sp.look[2] - sp.z; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
      const side = sp.signSide || 1, px = sp.x - dz * 1.75 * side + dx * 0.2, pz = sp.z + dx * 1.75 * side + dz * 0.2, rot = Math.atan2(-dx, -dz);
      const grp = new THREE.Group(); grp.position.set(px, yy, pz); grp.rotation.y = rot; signG.add(grp);
      // the pole stops under the plate and a short neck joins plate to disc, so nothing crosses the words
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.97, 10), ink); pole.position.y = 0.485; grp.add(pole);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 10), ink); neck.position.y = 1.63; grp.add(neck);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 20), ink); foot.position.y = 0.03; grp.add(foot);
      const DY = 2.18;
      for (const r of [0, Math.PI]) {
        const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 48), faceM); face.position.set(0, DY, r ? -0.032 : 0.032); face.rotation.y = r; grp.add(face);
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.62), plateM); plate.position.set(0, 1.28, r ? -0.032 : 0.032); plate.rotation.y = r; grp.add(plate);
      }
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.66, 0.06), ink); back.position.y = 1.28; grp.add(back);
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 40), ink); ring.rotation.x = Math.PI / 2; ring.position.y = DY; grp.add(ring);
      sp.signPos = new THREE.Vector3(px, yy, pz);
    }
    out.push({ ...sp, y: yy, disc, glow, pos: new THREE.Vector3(sp.x, yy, sp.z), r: 1.1 });
  }
  out.signGroup = signG;
  return out;
}

// the overlay + controls, laid over the 3D view
export function visionOverlay({ container, onExit = () => {}, onGuided = () => {} }) {
  let onShare = null;   // set by the page when multiplayer is ready: (on, cond, sev) => {}
  const css = document.createElement('style');
  css.textContent = `
  #vsim{position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s}
  #vsim .vb{position:absolute;inset:0}
  #vsim .vf{position:absolute;inset:-12%;will-change:transform}
  #vsimUI{position:fixed;left:0;right:0;top:0;z-index:12;display:none;background:#141312;color:#f3f2f2;font:400 13px/1.35 Archivo,Arimo,Helvetica,Arial,sans-serif;border-bottom:2px solid #ec3013;padding:calc(6px + env(safe-area-inset-top)) calc(8px + env(safe-area-inset-right)) 6px calc(8px + env(safe-area-inset-left))}
  #vsimUI .k{font:800 10px/1 Archivo,Arimo,sans-serif;letter-spacing:.16em;color:#ff9783;text-transform:uppercase}
  #vsimUI .t{font:800 17px/1.15 Archivo,Arimo,sans-serif;margin:3px 0 2px}
  #vsimUI .d{color:#cfcaca;font-size:12px;max-width:70ch}
  #vsimUI .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px}
  #vsimUI .row:first-child{margin-top:0}
  #vsimUI #vsChips{flex-wrap:nowrap;gap:4px}
  #vsimUI #vsChips button{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 4px;letter-spacing:0;font-size:clamp(9px,2.45vw,13px);white-space:nowrap;overflow:hidden}
  #vsimUI button{min-height:40px;padding:0 12px;background:transparent;color:#f3f2f2;border:2px solid #f3f2f2;font:800 11px/1 Archivo,Arimo,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
  #vsimUI button.on{background:#f3f2f2;color:#1d1c1b}
  #vsimUI button.x{background:#ec3013;border-color:#ec3013}
  #vsimUI button.learn{flex:1 1 100%;min-height:40px;background:#1f4fd8;border-color:#1f4fd8;font-size:13px;text-align:left;padding:0 14px;animation:vsPulse 1.6s ease-in-out infinite}
  #vsimUI button.learn span{text-transform:none;letter-spacing:.02em}
  @keyframes vsPulse{0%,100%{box-shadow:0 0 0 0 rgba(31,79,216,.75);background:#1f4fd8}50%{box-shadow:0 0 0 7px rgba(31,79,216,0);background:#3d6cf0}}
  @media (prefers-reduced-motion:reduce){#vsimUI button.learn{animation:none}}
  #vsimUI label{display:flex;align-items:center;gap:10px;flex:1 1 220px;font:800 10px/1 Archivo,Arimo,sans-serif;letter-spacing:.14em;text-transform:uppercase}
  #vsimUI input[type=range]{flex:1;accent-color:#ec3013;height:32px}
  #vsimUI .hint{font-size:11px;color:#a9a4a4;margin-top:6px}
  #vsimUI .hint b{color:#ff9783;font:800 12px/1 Archivo,Arimo,sans-serif;letter-spacing:.1em}
  /* Learn more: the Blind Canvas "Eye condition · Learn more" page (ableartalliance.com/ben). --acc is the condition's colour. */
  #vsLearn{position:fixed;inset:0;z-index:14;display:none;flex-direction:column;--acc:#5b8def;background:#0c0e12;color:#f3f5f8;font-family:Oswald,'Arial Narrow',sans-serif}
  #vsLearn .lbar{position:relative;z-index:3;flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;
    padding:calc(10px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right)) 10px calc(16px + env(safe-area-inset-left));
    background:rgba(12,14,18,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.08)}
  #vsLearn .lbar button{min-height:46px;padding:0 16px;border-radius:8px;cursor:pointer;font:700 13px/1 'Space Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}
  #vsLearn .lback{background:#fff;color:#0c0e12;border:0}
  #vsLearn .lread{background:transparent;color:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.22)}
  #vsLearn .lscroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;background:radial-gradient(circle at 70% -5%,rgba(255,255,255,.05) 0%,rgba(0,0,0,0) 45%)}
  #vsLearn .lwrap{max-width:1100px;margin:0 auto;padding:34px calc(20px + env(safe-area-inset-right)) calc(40px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left))}
  #vsLearn .kick{font:700 12px/1.4 'Space Mono',ui-monospace,monospace;letter-spacing:.34em;text-transform:uppercase;color:var(--acc)}
  #vsLearn h2.lt{margin:10px 0 12px;font:700 clamp(40px,11vw,76px)/.98 Oswald,'Arial Narrow',sans-serif;text-transform:uppercase;color:#f3f5f8;overflow-wrap:anywhere}
  #vsLearn .pill{display:inline-block;padding:6px 13px;border-radius:999px;background:var(--acc);color:#0c0e12;font:700 12px/1.2 'Space Mono',ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase}
  #vsLearn .tagl{margin:20px 0 30px;font:300 clamp(20px,5vw,25px)/1.4 Oswald,'Arial Narrow',sans-serif;color:rgba(255,255,255,.82)}
  #vsLearn .lgrid{display:grid;grid-template-columns:1fr;gap:30px}
  @media (min-width:760px){#vsLearn .lgrid{grid-template-columns:1.15fr 1fr;gap:44px}}
  #vsLearn h3{margin:0 0 13px;padding-left:13px;border-left:3px solid var(--acc);font:600 13px/1.2 Oswald,'Arial Narrow',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--acc)}
  #vsLearn .sec{margin-bottom:28px}
  #vsLearn .sec p{margin:0;font:300 18px/1.6 Oswald,'Arial Narrow',sans-serif;color:rgba(255,255,255,.86)}
  #vsLearn ul{margin:0;padding:0;list-style:none}
  #vsLearn li{position:relative;padding-left:20px;margin:0 0 9px;font:300 18px/1.5 Oswald,'Arial Narrow',sans-serif;color:rgba(255,255,255,.86)}
  #vsLearn li::before{content:'';position:absolute;left:2px;top:.62em;width:6px;height:6px;border-radius:50%;background:var(--acc)}
  #vsLearn .simv{border:1px solid rgba(255,255,255,.1);border-radius:6px;overflow:hidden;background:#000}
  #vsLearn .simv .pic{position:relative;aspect-ratio:1;overflow:hidden}
  #vsLearn .simv img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  #vsLearn .simv .ov,#vsLearn .simv .sp{position:absolute;inset:0}
  #vsLearn .simv .cap{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;font:400 10px/1.3 'Space Mono',ui-monospace,monospace;letter-spacing:.08em;color:rgba(255,255,255,.6);border-top:1px solid rgba(255,255,255,.08)}
  #vsLearn .simv .cap b{font-weight:400;text-transform:uppercase;letter-spacing:.16em;color:rgba(255,255,255,.5)}
  #vsLearn .facts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
  #vsLearn .facts div{padding:11px 12px 12px;border:1px solid rgba(255,255,255,.08);border-radius:6px;background:rgba(255,255,255,.03);font:600 15px/1.25 Oswald,'Arial Narrow',sans-serif;color:#f3f5f8}
  #vsLearn .facts b{display:block;margin-bottom:5px;font:400 10px/1.2 'Space Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
  #vsLearn .try{display:block;width:100%;margin-top:16px;min-height:52px;border:0;border-radius:6px;background:var(--acc);color:#0c0e12;cursor:pointer;font:600 15px/1 Oswald,'Arial Narrow',sans-serif;letter-spacing:.12em;text-transform:uppercase}
  #vsLearn .more{margin-top:36px;padding-top:24px;border-top:1px solid rgba(255,255,255,.08)}
  #vsLearn .more .ml{font:400 11px/1.2 'Space Mono',ui-monospace,monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:12px}
  #vsLearn .chips{display:flex;flex-wrap:wrap;gap:8px}
  #vsLearn .chips button{min-height:40px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:#16191f;color:#f3f5f8;cursor:pointer;font:700 12px/1 'Space Mono',ui-monospace,monospace;letter-spacing:.04em;text-transform:uppercase}
  #vsLearn .chips button.on{background:var(--acc);border-color:var(--acc);color:#0c0e12}
  #vsLearn button:focus-visible{outline:3px solid #fff;outline-offset:3px}
  @media (max-height:500px){#vsimUI .row{margin-top:4px}#vsimUI button{min-height:34px}#vsimUI button.learn{min-height:34px}}
  @media (max-width:520px){#vsimUI button{min-height:38px;padding:0 9px;font-size:10px}#vsimUI #vsChips button{padding:0 3px}}`;
  document.head.appendChild(css);
  const ov = document.createElement('div'); ov.id = 'vsim'; ov.setAttribute('aria-hidden', 'true');
  const blurL = document.createElement('div'); blurL.className = 'vb'; const spotL = document.createElement('div'); spotL.className = 'vf';
  ov.append(blurL, spotL); container.appendChild(ov);
  const touch = matchMedia('(pointer:coarse)').matches;
  const ui = document.createElement('div'); ui.id = 'vsimUI'; ui.setAttribute('role', 'region'); ui.setAttribute('aria-label', 'Vision simulator');
  // kept as small as it can be, so the simulated view gets the screen: the conditions on one line, Learn, then severity + Back
  ui.innerHTML = `<div class="row" id="vsChips"></div>
    <div class="row"><button id="vsL" class="learn">Learn about: <span id="vsLn"></span></button></div>
    <div class="row"><label for="vsSev">Severity <span id="vsP">60%</span><input id="vsSev" type="range" min="0" max="100" value="60"></label>
      <button id="vsX" class="x">← Back</button><button id="vsS" aria-pressed="false" style="display:none">👥 Show everyone</button></div>`;
  document.body.appendChild(ui);
  const $ = id => ui.querySelector('#' + id);
  const live = document.createElement('div'); live.setAttribute('aria-live', 'polite'); live.style.cssText = 'position:absolute;left:-9999px'; document.body.appendChild(live);
  const st = { t0: 0, on: false, cond: 'rp', sev: 0.6, shown: 0, gx: 50, gy: 50, lead: [0, 0], lag: [0, 0], lagV: [0, 0], t: 0, guided: false };
  CONDITIONS.forEach(c => { const b = document.createElement('button'); b.textContent = c.chip; b.dataset.c = c.id; b.onclick = () => setCond(c.id); $('vsChips').appendChild(b); });
  function setCond(id) {
    st.cond = id; const c = CONDITIONS.find(x => x.id === id);
    $('vsLn').textContent = id === 'floaters' ? 'Diabetic Retinopathy' : c.label;   // floaters are what diabetic retinopathy looks like; the Learn page explains it
    ui.querySelectorAll('#vsChips button').forEach(b => { b.classList.toggle('on', b.dataset.c === id); b.setAttribute('aria-pressed', b.dataset.c === id); });
    live.textContent = c.label + '. ' + c.desc;
    if (st.sharing && onShare) onShare(true, st.cond, st.sev);
  }
  let shareT = 0;
  $('vsSev').oninput = e => { st.sev = e.target.value / 100; $('vsP').textContent = e.target.value + '%'; if (st.sharing && onShare && performance.now() - shareT > 200) { shareT = performance.now(); onShare(true, st.cond, st.sev); } };
  $('vsSev').onchange = () => { if (st.sharing && onShare) onShare(true, st.cond, st.sev); };
  const setSharing = v => { st.sharing = v; $('vsS').classList.toggle('on', v); $('vsS').setAttribute('aria-pressed', v); $('vsS').textContent = v ? '👥 Showing everyone ✕' : '👥 Show everyone'; if (onShare) onShare(v, st.cond, st.sev); };
  $('vsS').onclick = () => setSharing(!st.sharing);
  $('vsX').onclick = () => onExit();
  // Learn more: the condition's page from the Patient Experience (what it is, what it's like, living with it, key facts)
  const lp = document.createElement('div'); lp.id = 'vsLearn'; lp.setAttribute('role', 'dialog'); lp.setAttribute('aria-modal', 'true'); document.body.appendChild(lp);
  const esc = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  // the Blind Canvas fonts for the Learn page (Oswald + Space Mono), added once
  if (!document.getElementById('vsLearnFonts')) { const f = document.createElement('link'); f.id = 'vsLearnFonts'; f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;600;700&family=Space+Mono:wght@400;700&display=swap'; document.head.appendChild(f); }
  // a painting for each condition's "simulated view", seen through that condition (AR folder paths)
  const VIEW = { rp: ['targets/almost-blindness.jpg', 'Almost Blindness', 'Ben Fox'], amd: ['targets/curating-hope.jpg', 'Curating Hope', 'Ben Fox'],
    cataracts: ['targets/walk-through-fear.jpg', 'Walk Through Fear', 'Ben Fox'], glaucoma: ['targets/napkin-please.jpg', 'Napkin, Please', 'Wayne Pearcy'],
    dr: ['targets/decision-divide.jpg', 'Decision Divide', 'Will Hollimon'] };
  const ORDER = ['rp', 'amd', 'cataracts', 'glaucoma', 'dr'], toCond = k => (k === 'dr' ? 'floaters' : k);
  let learnKey = 'rp', lastFocus = null;
  const openLearn = (key) => {
    learnKey = typeof key === 'string' ? key : (st.cond === 'floaters' ? 'dr' : st.cond);
    const L = LEARN[learnKey] || LEARN.rp, V = VIEW[learnKey] || VIEW.rp;
    const S = simStyle(toCond(learnKey), 0.6, 50, 48);
    lp.style.setProperty('--acc', L.accent);
    lp.innerHTML = `<div class="lbar"><button class="lback" id="vsLb">← Back to simulator</button><button class="lread" id="vsLr" aria-pressed="false">🔊 Read aloud</button></div>
      <div class="lscroll"><div class="lwrap">
        <div class="kick">Eye condition · Learn more</div>
        <h2 class="lt" id="vsLh">${esc(L.label)}</h2>
        <span class="pill">${esc(L.common)}</span>
        <p class="tagl">${esc(L.tagline)}</p>
        <div class="lgrid">
          <div>
            <div class="sec"><h3>What it is</h3><p>${esc(L.whatIs)}</p></div>
            <div class="sec"><h3>What you might experience</h3><ul>${L.experience.map(x => '<li>' + esc(x) + '</li>').join('')}</ul></div>
            <div class="sec"><h3>Living with it</h3><ul>${L.living.map(x => '<li>' + esc(x) + '</li>').join('')}</ul></div>
          </div>
          <div>
            <figure class="simv" style="margin:0"><div class="pic"><img src="${V[0]}" alt="" style="filter:${S.filter}"><div class="ov" style="background:${S.background}"></div><div class="sp" style="background:${S.spots}"></div></div>
              <figcaption class="cap"><b>Simulated view</b><span>‘${esc(V[1])}’ · ${esc(V[2])}</span></figcaption></figure>
            <div class="facts">${L.facts.map(f => '<div><b>' + esc(f.k) + '</b>' + esc(f.v) + '</div>').join('')}</div>
            <button class="try" id="vsLt">Experience it in the simulator ↗</button>
          </div>
        </div>
        <div class="more"><div class="ml">Explore other conditions</div><div class="chips">${ORDER.map(k => '<button data-k="' + k + '" class="' + (k === learnKey ? 'on' : '') + '" aria-pressed="' + (k === learnKey) + '">' + esc(LEARN[k].label) + '</button>').join('')}</div></div>
      </div></div>`;
    lp.setAttribute('aria-labelledby', 'vsLh');
    if (lp.style.display !== 'flex') lastFocus = document.activeElement;
    lp.style.display = 'flex'; lp.querySelector('.lscroll').scrollTop = 0;
    lp.querySelector('#vsLb').focus({ preventScroll: true });
    lp.querySelector('#vsLb').onclick = closeLearn;
    lp.querySelector('#vsLt').onclick = () => { setCond(toCond(learnKey)); closeLearn(); };
    lp.querySelectorAll('.chips button').forEach(b => b.onclick = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); openLearn(b.dataset.k); });
    lp.querySelector('#vsLr').onclick = () => {
      const sy = window.speechSynthesis; if (!sy) return;
      if (sy.speaking) { sy.cancel(); return; }
      sy.speak(new SpeechSynthesisUtterance([L.label, L.common, L.tagline, 'What it is. ' + L.whatIs, 'What you might experience. ' + L.experience.join('. '),
        'Living with it. ' + L.living.join('. '), L.facts.map(f => f.k + ': ' + f.v).join('. ')].join('. ')));
    };
  };
  const closeLearn = () => {
    if (lp.style.display !== 'flex') return;
    lp.style.display = 'none'; if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lp.style.display === 'flex') closeLearn(); });
  $('vsL').onclick = () => openLearn();
  setCond('rp');
  return {
    st,
    open(cond) {
      st.guest = null;
      st.on = true; st.shown = 0; st.t0 = st.t; if (cond) setCond(cond); ui.style.display = 'block'; ov.style.opacity = 1;
      live.textContent = 'Vision simulator on. ' + CONDITIONS.find(x => x.id === st.cond).label + '. Move your phone to look around.';
    },
    learnOpen: () => lp.style.display === 'flex', closeLearn: () => closeLearn(),
    close() { if (st.sharing) setSharing(false); closeLearn(); st.on = false; ui.style.display = 'none'; st.guided = false; live.textContent = 'Vision simulator off.'; },
    // group vision: the page turns on "Show everyone" once multiplayer is ready
    setShareHandler(fn, others) { onShare = fn; $('vsS').style.display = fn && others ? '' : 'none'; },
    sharing: () => !!st.sharing,
    // seeing through someone else's eyes: the filter only (no panel, you can still walk). Ignored while you're on your own circle.
    guestView(cond, sev, who) {
      if (st.on && !st.guest) return false;
      const c = CONDITIONS.find(x => x.id === cond); if (!c) return false;
      if (!st.guest) { st.t0 = st.t; st.shown = 0; live.textContent = 'You are seeing through ' + who + "'s eyes: " + c.label + '.'; }
      st.guest = who; st.on = true; st.cond = cond; st.sev = Math.max(0, Math.min(1, +sev || 0.6)); ov.style.opacity = 1; return true;
    },
    guestEnd() { if (!st.guest) return; st.guest = null; st.on = false; live.textContent = 'Your own view is back.'; },
    isGuest: () => st.guest,
    setGuided(v) { st.guided = v; },
    // dt seconds; yawRate/pitchRate: how fast the view is turning (rad/s)
    update(dt, yawRate, pitchRate) {
      st.t += dt;
      // sight settles in over ~2.5 s when you step on, clears over ~1 s when you step off
      const target = st.on ? st.sev : 0, rate = !st.on ? 0.9 : st.t - st.t0 < 2.6 ? 0.42 : 3;
      st.shown += THREE.MathUtils.clamp(target - st.shown, -rate * dt, rate * dt);
      if (!st.on && st.shown <= 0.001) { ov.style.opacity = 0; blurL.style.background = 'none'; blurL.style.backdropFilter = blurL.style.webkitBackdropFilter = 'none'; spotL.style.background = 'none'; return; }
      // eyes lead the turn a little (saccade), then settle back to the centre
      const lx = THREE.MathUtils.clamp(-yawRate * 7, -14, 14), ly = THREE.MathUtils.clamp(pitchRate * 6, -10, 10);
      st.lead[0] += (lx - st.lead[0]) * Math.min(1, dt * 6); st.lead[1] += (ly - st.lead[1]) * Math.min(1, dt * 6);
      st.gx = 50 + st.lead[0] + Math.sin(st.t / 0.68) * 0.7; st.gy = 48 + st.lead[1] + Math.cos(st.t / 0.91) * 0.7;
      const S = simStyle(st.cond, Math.max(0, st.shown), st.gx.toFixed(1), st.gy.toFixed(1));
      blurL.style.background = S.background; blurL.style.backdropFilter = blurL.style.webkitBackdropFilter = S.filter;
      spotL.style.background = S.spots;
      // floaters: dragged along by eye movement, then they drift back (spring), plus a slow wander
      const k = 18, damp = 3.2;
      st.lagV[0] += (-st.lag[0] * k - st.lagV[0] * damp + yawRate * 60) * dt; st.lagV[1] += (-st.lag[1] * k - st.lagV[1] * damp - pitchRate * 50) * dt;
      st.lag[0] += st.lagV[0] * dt; st.lag[1] += st.lagV[1] * dt;
      const wx = Math.sin(st.t / 3.1) * 1.6 + st.lag[0], wy = Math.cos(st.t / 4.3) * 1.2 + st.lag[1];
      spotL.style.transform = `translate(${THREE.MathUtils.clamp(wx, -9, 9).toFixed(2)}%, ${THREE.MathUtils.clamp(wy, -9, 9).toFixed(2)}%)`;
    },
  };
}
