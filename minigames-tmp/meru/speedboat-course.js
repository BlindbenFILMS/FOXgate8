// SPEEDBOAT BAY course layout [meruSpeedboatBay], course frame (beach + boathouse at -z, the course runs +z).
// ONE copy, read by the course itself (minigames/meru/speedboat-bay.js) and by Meru 2's bay arm (worlds/meru2-bay-course.js: world = course + BAY.course.origin).
export const Q = (x, z) => [x * 2, z * 2 + 60];   // s30: the bay doubled from the beach
export const BAY_COURSE = {
  PATH: [[0, -38], [0, 360], [60, 380], [150, 360], [150, 184], [144, 60], [80, 8]], LANT: 42, LANT_STEP: 24, LINE: 36, LINE_STEP: 8,
  SLALOM: [[6, -12], [-6, -2], [6, 8], [-6, 18], [6, 28]].map(p => Q(...p)),
  RING: { x: 0, z: 156, r: 16 },
  SIGNS: [['1', 'SLALOM', 0, 22], ['2', 'RING', 0, 132], ['3', 'RAMPS', 0, 180], ['4', 'TARGETS', 0, 278], ['5', 'SHALLOWS', 150, 338, 0], ['6', 'ROBOTS', 148, 176, 0]],
  BARS: [{ x: 0, z: 216, a: 22, b: 5 }, { x: 0, z: 260, a: 22, b: 5 }],
  RAMPS: [{ x: 0, z: 192, yaw: 0, w: 14, l: 6, h: 2.2, top: 0 }, { x: 0, z: 236, yaw: 0, w: 14, l: 6, h: 2.4, top: 0 }],
  SH: { x0: 116, x1: 192, z0: 184, z1: 324 },
  BARRELS: [[-12, 114], [12, 118], [-4, 128], [6, 134], [-14, 140], [14, 142]].map(p => Q(...p)),
  TARGETS: [[-8, 120], [8, 128], [0, 140], [-16, 130]].map(p => Q(...p)),
  SENTRIES: [[-18, 150], [18, 112]].map(p => Q(...p)),
  GATES: [[28, 16], [-100, 80], [-150, 220], [-120, 350], [0, 376], [76, 340], [76, 180], [60, 60]]
};
