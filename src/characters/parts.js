// Geometrias compartilhadas por TODOS os personagens (criadas uma única vez).
import * as THREE from 'three'

const lathe = (pts, seg = 22) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)
const limb = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14).translate(0, -len / 2, 0)

export const RIG = {
  hipY: 0.48,
  shoulderY: 0.86,
  shoulderX: 0.2,
  headY: 1.17,
  headR: 0.24,
  thigh: 0.2,
  upperArm: 0.17,
}

export const P = {
  // Tronco com cintura e ombros arredondados
  torso: lathe([[0, 0], [0.15, 0], [0.18, 0.035], [0.195, 0.13], [0.185, 0.27], [0.2, 0.37], [0.185, 0.43], [0.13, 0.48], [0.06, 0.5], [0, 0.5]]),
  // Peito do avental / colete (meia casca frontal)
  hips: lathe([[0, -0.06], [0.13, -0.06], [0.175, -0.02], [0.185, 0.06], [0.17, 0.1], [0, 0.1]]),
  skirt: lathe([[0, 0.02], [0.18, 0.02], [0.2, -0.04], [0.26, -0.26], [0.27, -0.29], [0, -0.29]]),
  apron: new THREE.CylinderGeometry(0.205, 0.235, 0.36, 20, 1, true, -Math.PI * 0.42, Math.PI * 0.84),
  vestFront: new THREE.CylinderGeometry(0.208, 0.2, 0.42, 22, 1, true, Math.PI * 0.13, Math.PI * 1.74),
  beard: new THREE.SphereGeometry(1, 20, 10, 0, Math.PI, Math.PI * 0.66, Math.PI * 0.34),
  upperArm: limb(0.058, 0.17),
  sleeveShort: new THREE.CylinderGeometry(0.075, 0.07, 0.13, 14).translate(0, -0.04, 0),
  forearm: limb(0.05, 0.15),
  hand: new THREE.SphereGeometry(0.058, 14, 10),
  thigh: limb(0.078, 0.2),
  shin: limb(0.066, 0.2),
  shoe: new THREE.SphereGeometry(1, 16, 10),
  neck: new THREE.CylinderGeometry(0.065, 0.07, 0.1, 14),
  head: new THREE.SphereGeometry(1, 28, 20),
  ear: new THREE.SphereGeometry(1, 12, 8),
  eyeWhite: new THREE.SphereGeometry(1, 16, 12),
  pupil: new THREE.SphereGeometry(1, 12, 8),
  brow: new THREE.CapsuleGeometry(0.012, 0.055, 4, 8).rotateZ(Math.PI / 2),
  smile: new THREE.TorusGeometry(0.05, 0.013, 8, 18, Math.PI).rotateZ(Math.PI),
  frown: new THREE.TorusGeometry(0.045, 0.012, 8, 18, Math.PI),
  mouthLine: new THREE.CapsuleGeometry(0.011, 0.05, 4, 8).rotateZ(Math.PI / 2),
  mouthOpen: new THREE.SphereGeometry(1, 14, 10),
  // Cabelos
  hairCap: new THREE.SphereGeometry(1, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
  hairBack: new THREE.SphereGeometry(1, 22, 14, Math.PI, Math.PI, 0, Math.PI * 0.82),
  hairBob: new THREE.SphereGeometry(1, 24, 16, Math.PI * 0.82, Math.PI * 1.36, 0, Math.PI * 0.74),
  spike: new THREE.ConeGeometry(0.05, 0.14, 8),
  tail: new THREE.CapsuleGeometry(0.055, 0.22, 4, 10),
  // Chapéus
  toqueBand: new THREE.CylinderGeometry(0.215, 0.225, 0.1, 24),
  toquePuff: lathe([[0, 0], [0.2, 0], [0.24, 0.06], [0.27, 0.15], [0.25, 0.22], [0.18, 0.27], [0.08, 0.29], [0, 0.29]], 24),
  capDome: new THREE.SphereGeometry(1, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
  brim: new THREE.CylinderGeometry(1, 1, 1, 20, 1, false, -Math.PI * 0.5, Math.PI),
  helmet: new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
  ring: new THREE.TorusGeometry(1, 0.12, 8, 24),
  bowtie: new THREE.ConeGeometry(0.035, 0.07, 4),
  button: new THREE.SphereGeometry(0.014, 8, 6),
  box: new THREE.BoxGeometry(1, 1, 1),
  disc: new THREE.CylinderGeometry(1, 1, 1, 24),
  glassRing: new THREE.TorusGeometry(0.05, 0.009, 6, 18),
  circle: new THREE.CircleGeometry(1, 24),
}
