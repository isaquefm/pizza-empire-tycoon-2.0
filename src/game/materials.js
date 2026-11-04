// Cache de materiais e geometrias compartilhadas — evita criar milhares de
// objetos idênticos e reduz trocas de estado na GPU.
import * as THREE from 'three'

const mats = new Map()
export function mat(color, o = {}) {
  const key = `${color}|${o.r ?? ''}|${o.m ?? ''}|${o.e ?? ''}|${o.ei ?? ''}|${o.op ?? ''}|${o.map?.uuid ?? ''}|${o.side ?? ''}|${o.basic ? 1 : 0}`
  let m = mats.get(key)
  if (!m) {
    if (o.basic) {
      m = new THREE.MeshBasicMaterial({ color, map: o.map || null, transparent: o.op != null, opacity: o.op ?? 1, depthWrite: o.op == null, side: o.side ?? THREE.FrontSide, toneMapped: false })
    } else {
      m = new THREE.MeshStandardMaterial({
        color, roughness: o.r ?? 0.72, metalness: o.m ?? 0,
        emissive: o.e || '#000000', emissiveIntensity: o.ei ?? 1,
        map: o.map || null, transparent: o.op != null, opacity: o.op ?? 1, side: o.side ?? THREE.FrontSide,
      })
    }
    mats.set(key, m)
  }
  return m
}

// Geometrias unitárias reutilizáveis (escaladas por instância)
export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 22, 16),
  sphereLo: new THREE.SphereGeometry(1, 12, 9),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 24),
  cylLo: new THREE.CylinderGeometry(1, 1, 1, 10),
  cone: new THREE.ConeGeometry(1, 1, 18),
  torus: new THREE.TorusGeometry(1, 0.08, 10, 28),
  plane: new THREE.PlaneGeometry(1, 1),
  circle: new THREE.CircleGeometry(1, 28),
}

// Caixa arredondada simples (bevel) compartilhada por tamanho
const rounded = new Map()
export function roundedBox(w, h, d, r = 0.05, seg = 3) {
  const key = `${w}|${h}|${d}|${r}`
  if (rounded.has(key)) return rounded.get(key)
  const shape = new THREE.Shape()
  const x = -w / 2, y = -h / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y)
  const g = new THREE.ExtrudeGeometry(shape, { depth: d - r * 2, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: seg, curveSegments: 4 })
  g.translate(0, 0, -(d - r * 2) / 2)
  g.computeVertexNormals()
  rounded.set(key, g)
  return g
}

export function disposeAll() {
  mats.forEach((m) => m.dispose())
  mats.clear()
  rounded.forEach((g) => g.dispose())
  rounded.clear()
}
