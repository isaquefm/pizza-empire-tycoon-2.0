// Estado mutável da simulação (fora do React por desempenho).
// Os componentes 3D leem estes objetos diretamente em useFrame.
import { findPath } from './Navigation/pathfinding'

export const world = {
  customers: new Map(),
  workers: new Map(),
  orders: new Map(),
  seats: [],
  prep: [],
  ovens: [],
  pickup: [],
  queue: [],
  payQueue: [],
  popups: [],
  nextId: 1,
  version: 0,
  spawnTimer: 2,
  deliveryTimer: 20,
  boost: 0,
}

export const uid = (p) => `${p}${world.nextId++}`
export const bump = () => { world.version++ }

export function resetWorld() {
  world.customers.clear(); world.workers.clear(); world.orders.clear()
  world.seats = []; world.prep = []; world.ovens = []; world.pickup = []; world.queue = []; world.payQueue = []; world.popups = []
  world.spawnTimer = 2; world.deliveryTimer = 20
  bump()
}

export function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

export function setPath(e, to) {
  e.path = findPath({ x: e.x, z: e.z }, to)
  e.pathI = 0
}

// Avança pelo caminho; retorna true quando chega
export function stepMove(e, dt) {
  if (!e.path || e.pathI >= e.path.length) return true
  const p = e.path[e.pathI]
  const dx = p.x - e.x, dz = p.z - e.z
  const dist = Math.hypot(dx, dz)
  const step = e.speed * dt
  e.anim = 'walk'
  if (dist > 0.001) e.targetRot = Math.atan2(dx, dz)
  if (dist <= step) {
    e.x = p.x; e.z = p.z; e.pathI++
    return e.pathI >= e.path.length
  }
  e.x += (dx / dist) * step
  e.z += (dz / dist) * step
  return false
}

export function popup(x, z, text, color = '#2f9e5b') {
  world.popups.push({ id: uid('p'), x, z, text, color, t: 0 })
  if (world.popups.length > 14) world.popups.shift()
}

export const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2
