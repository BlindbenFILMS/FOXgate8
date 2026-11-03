// MERU — the Fortune Teller [meruFortune]: Ora's tent on the square. Same scene, far south, quick fade.
// Ora's talk follows the story exactly as the 2D openSeerTalk does (worlds/meru-ora.json, verbatim, in its order:
// 0 after the fleet · 1 Max home · 2 Max following · 3 Max freed · 4 asked in the tavern · 5 the lake lead · 6 knows he is missing · 7 does not know yet).
export const TENT = { x: 480, z: 230, w: 11, d: 11, h: 5, key: 'fortune', label: 'Fortune Teller', b: 5 };
TENT.exit = { x: TENT.x, z: TENT.z + TENT.d / 2 - 1.0 };
export const ORA = { key: 'ora', name: 'Ora', role: 'Fortune Teller', outfit: 'robe', female: true, torso: ['#c4b5fd', '#7c3aed', '#3b0764'], crest: '8', x: TENT.x, z: TENT.z - 2.2, face: 0, mood: 'warm' };
export function oraIndex(flag) {
  if (flag('finaleWon')) return 0; if (flag('maxHome')) return 1; if (flag('maxFollowing')) return 2; if (flag('maxFreed')) return 3;
  if (flag('maxTavernAsked')) return 4; if (flag('maxTavernLead')) return 5; if (flag('maxSearchTold') || flag('maxTavernLead')) return 6; return 7;
}
export function buildTent(K) {
  const { THREE, scene, M, toon, glowing, glowSprite, roomLights, colliders, GOLD, WOOD } = K;
  const R = TENT, T = new THREE.Group(); T.position.set(R.x, 0, R.z); scene.add(T);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(R.w / 2, 40), toon('#3b1d5a')); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; T.add(rug);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R.w / 2 - 0.6, 0.06, 6, 48), toon('#e6b45a')); ring.rotation.x = Math.PI / 2; ring.position.y = 0.03; T.add(ring);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R.w / 2, R.w / 2, R.h, 32, 1, true, Math.PI * 0.08, Math.PI * 1.84), toon('#5b2a7a', { side: THREE.DoubleSide })); wall.position.y = R.h / 2; wall.rotation.y = Math.PI / 2 + Math.PI; T.add(wall);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(R.w / 2 + 0.3, 3.2, 32, 1, true), toon('#6d28d9', { side: THREE.DoubleSide })); roof.position.y = R.h + 1.6; T.add(roof);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; M(new THREE.ConeGeometry(0.14, 0.32, 3), toon(i % 2 ? '#e6b45a' : '#f2f0ea'), Math.cos(a) * (R.w / 2 - 0.2), R.h - 0.2, Math.sin(a) * (R.w / 2 - 0.2), T, 0).rotation.x = Math.PI; }
  // the round table, cloth, crystal ball, candles, cushions
  M(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 24), WOOD, 0, 0.8, -1.2, T, 0.02, 0.9); M(new THREE.CylinderGeometry(0.15, 0.25, 0.8, 10), WOOD, 0, 0.4, -1.2, T, 0.01, 0.25);
  M(new THREE.CylinderGeometry(1.0, 1.05, 0.5, 24, 1, true), toon('#7c3aed', { side: THREE.DoubleSide }), 0, 0.6, -1.2, T, 0);
  const ball = M(new THREE.SphereGeometry(0.32, 20, 14), glowing('#a5f3fc', null, 1.2), 0, 1.16, -1.2, T, 0.015, 0.32); ball.castShadow = false; glowSprite(0, 1.16, -1.2, 0x8be9ff, 2.6, T);
  M(new THREE.TorusGeometry(0.24, 0.05, 6, 16), GOLD, 0, 0.88, -1.2, T, 0).rotation.x = Math.PI / 2;
  for (const [x, z] of [[-0.6, -1.6], [0.6, -1.6], [0.7, -0.7]]) { M(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 6), toon('#f4f1ec'), x, 0.94, z, T, 0); glowSprite(x, 1.1, z, 0xffc060, 0.6, T); }
  for (const [x, z, c] of [[-2.8, 1.5, '#c42d3c'], [2.8, 1.5, '#e6b45a'], [-3.2, -1.5, '#38bdf8']]) M(new THREE.CylinderGeometry(0.5, 0.55, 0.25, 12), toon(c), x, 0.12, z, T, 0.01, 0.55);
  colliders.push({ c: [R.x, R.z - 1.2, 1.1] });
  const L = new THREE.PointLight(0xc4b5fd, 0, 12, 1.4); L.position.set(R.x, 3, R.z - 0.5); scene.add(L); roomLights.push({ L, k: 9 });
  return { group: T, ball, update(t) { ball.material.emissiveIntensity = 0.9 + Math.sin(t * 2.2) * 0.4; } };
}
