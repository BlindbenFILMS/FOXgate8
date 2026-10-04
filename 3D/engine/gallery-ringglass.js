// Blind Canvas gallery: the outer ring's big windows, glazed with stained-glass versions of the artists' work.
// The ring round the back of the museum (the music room, the wings round it) is a 21-sided band carried on pillars, its beam's
// underside at 16.59 m; between the pillars, tall openings. Each opening facing the gardens and the city gets a pane from 4.3 m
// (above the ground-floor doorways, so nothing changes underfoot) up to the beam: one artwork as a large stained-glass medallion,
// framed in ink with a gold fillet, set in the facade's blue-and-opal leading. The three openings on the main-hall side (where
// the 2nd floor and the skywalk meet the ring) stay open.
import * as THREE from '../vendor/three/three.module.js';
import { artGlass } from './gallery-stained.js';

// the beam's corners (inner, outer) going round the ring, from the model
const V = [[-244.36, -16.0, -246.77, -17.18], [-240.74, -33.17, -242.9, -35.56], [-234.44, -47.31, -236.15, -50.69], [-226.02, -57.15, -227.13, -61.23], [-216.24, -61.82, -216.64, -66.25],
  [-205.94, -60.92, -205.61, -65.28], [-196.06, -54.53, -195.01, -58.43], [-187.46, -43.2, -185.8, -46.29], [-180.91, -27.94, -178.79, -29.96], [-176.99, -10.1, -174.6, -10.87],
  [-176.06, 8.73, -173.6, 9.27], [-178.2, 26.87, -175.89, 28.67], [-183.22, 42.7, -181.26, 45.62], [-190.66, 54.82, -189.23, 58.6], [-199.86, 62.16, -199.1, 66.47],
  [-210.02, 64.07, -209.98, 68.51], [-220.22, 60.38, -220.92, 64.56], [-229.57, 51.42, -230.93, 54.96], [-237.23, 37.98, -239.14, 40.56], [-242.52, 21.24, -244.8, 22.65], [-244.97, 2.7, -247.42, 2.82]];
// which artwork (title, image) in which opening (index = the opening starting at corner i); 8, 9, 10 face the main hall and stay open
export const RING_ART = {
  0: null, 1: ['The Power Within', 'gallery/img/wix_amb_22.webp'], 2: ['Flow State', 'gallery/img/wix_raquel_22.webp'], 3: ['Midnight Melodies', 'gallery/img/wix_wayne_trumpet.webp'], 4: ['Lighthouse of Hope', 'gallery/img/wix_c_lighthouse.webp'], 5: ['Rhythm of Life', 'gallery/img/wix_will_drums.webp'], 6: ['Roots of Kinship', 'gallery/img/wix_am_familytree.webp'], 7: ['Rhapsody in Blue', 'gallery/img/wix_m_rhapsody.webp'],
  11: ['Pour In The Love', 'gallery/img/wix_steven_heart.webp'], 12: ['The Visions That We Share', 'gallery/img/wix_d_1.webp'], 13: ['I Am Blind, Like My Hair Is Brown', 'gallery/img/wix_alayna_hair.webp'], 14: ['Reaching Past Blindness', 'gallery/img/wix_rusty_reach.webp'], 15: ['GOALBALL IS...', 'gallery/img/ricky_r_goalball_optimized_269676269.webp'], 16: ['Joyride', 'gallery/img/wix_deja_joyride.webp'],
  17: ['Pedals of Freedom', 'gallery/img/wix_b_bicycle.webp'], 18: null, 19: ['Walk Through Fear', 'gallery/img/wix_walk_through_fear.webp'] };   // null: crossed by the ring's diagonal braces, so plain leaded glass
const Y0 = 4.3, Y1 = 16.56, RC = [-210, 0];

export function buildRingGlass({ scene, data, resolveImg = u => u }) {
  const g = new THREE.Group(); scene.add(g);
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const loader = new THREE.ImageLoader(); loader.setCrossOrigin('anonymous');
  const mid = i => [(V[i][0] + V[i][2]) / 2, (V[i][1] + V[i][3]) / 2];
  const panes = [];
  for (const [k, title] of Object.entries(RING_ART)) {
    const i = +k, A = mid(i), B = mid(i + 1), dx = B[0] - A[0], dz = B[1] - A[1], W = Math.hypot(dx, dz), H = Y1 - Y0;
    // seen from inside the ring, the picture must read left to right: flip it if A->B runs to the viewer's left
    const cx = (A[0] + B[0]) / 2 - RC[0], cz = (A[1] + B[1]) / 2 - RC[1], f = Math.hypot(cx, cz), fx = cx / f, fz = cz / f;   // outward
    const flip = (dx * -fz + dz * fx) < 0;
    const S = Math.min(W - 2.2, H - 2.2) / 2;
    const mat = artGlass({ size: [W, H], art: title ? [W / 2, H / 2 + 0.3, S, S] : [-99, -99, 0, 0], flip, seed: i * 1.37 });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([A[0], Y0, A[1], B[0], Y0, B[1], B[0], Y1, B[1], A[0], Y1, A[1]], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); geo.setIndex([0, 1, 2, 0, 2, 3]); geo.computeVertexNormals();
    const pane = new THREE.Mesh(geo, mat); pane.renderOrder = 4; g.add(pane);
    // a slim ink transom along the bottom of the glass
    const tr = new THREE.Mesh(new THREE.BoxGeometry(W, 0.16, 0.22), ink); tr.position.set((A[0] + B[0]) / 2, Y0 - 0.06, (A[1] + B[1]) / 2); tr.rotation.y = -Math.atan2(dz, dx); g.add(tr);
    // the art, drawn small (256 px is plenty for panes ~26 cm across), loaded when it's needed
    const src = title && title[1];
    if (src) panes.push({ mat, src, x: (A[0] + B[0]) / 2, z: (A[1] + B[1]) / 2, loaded: false });
    pane.userData.title = title && title[0];
  }
  // load each pane's art the first time a visitor comes within 120 m (the whole back of the museum, but not from the plaza)
  function tick(Pl) {
    for (const p of panes) if (!p.loaded && Math.hypot(Pl.x - p.x, Pl.z - p.z) < 120) {
      p.loaded = true;
      loader.load(resolveImg(p.src), im => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; cv.getContext('2d').drawImage(im, 0, 0, 256, 256);
        const t = new THREE.CanvasTexture(cv); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
        p.mat.uniforms.uMap.value = t; p.mat.uniforms.uHas.value = 1; }, undefined, () => {});
    }
  }
  g.updateMatrixWorld(true);
  return { group: g, tick, panes };
}
