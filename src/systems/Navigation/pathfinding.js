// Pathfinding A* em grade (0,25 m) com suavização por linha de visão.
// A grade é reconstruída apenas quando o layout muda (ex.: varanda construída).

const CELL = 0.25
const MIN_X = -18, MAX_X = 18, MIN_Z = -7.5, MAX_Z = 15.5
const W = Math.ceil((MAX_X - MIN_X) / CELL)
const H = Math.ceil((MAX_Z - MIN_Z) / CELL)
const INFLATE = 0.17

let blocked = new Uint8Array(W * H)

const toCell = (x, z) => [
  Math.max(0, Math.min(W - 1, Math.floor((x - MIN_X) / CELL))),
  Math.max(0, Math.min(H - 1, Math.floor((z - MIN_Z) / CELL))),
]
const cellCenter = (cx, cz) => ({ x: MIN_X + (cx + 0.5) * CELL, z: MIN_Z + (cz + 0.5) * CELL })

export function buildGrid(obstacles) {
  blocked = new Uint8Array(W * H)
  for (const [a, b, c, d] of obstacles) {
    const [x0, z0] = toCell(a - INFLATE, b - INFLATE)
    const [x1, z1] = toCell(c + INFLATE - 0.001, d + INFLATE - 0.001)
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) blocked[z * W + x] = 1
  }
}

const isFree = (cx, cz) => cx >= 0 && cz >= 0 && cx < W && cz < H && !blocked[cz * W + cx]

function nearestFree(cx, cz) {
  if (isFree(cx, cz)) return [cx, cz]
  for (let r = 1; r < 12; r++) {
    for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue
      if (isFree(cx + dx, cz + dz)) return [cx + dx, cz + dz]
    }
  }
  return [cx, cz]
}

// Heap binário mínimo simples
class Heap {
  constructor() { this.a = [] }
  push(n) { const a = this.a; a.push(n); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p].f <= a[i].f) break; [a[p], a[i]] = [a[i], a[p]]; i = p } }
  pop() {
    const a = this.a, top = a[0], last = a.pop()
    if (a.length) { a[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < a.length && a[l].f < a[m].f) m = l; if (r < a.length && a[r].f < a[m].f) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m } }
    return top
  }
  get size() { return this.a.length }
}

const gScore = new Float32Array(W * H)
const came = new Int32Array(W * H)
const stamp = new Uint32Array(W * H)
let run = 1
const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]]

function lineFree(a, b) {
  const dx = b.x - a.x, dz = b.z - a.z
  const steps = Math.ceil(Math.hypot(dx, dz) / (CELL * 0.5))
  for (let i = 1; i < steps; i++) {
    const [cx, cz] = toCell(a.x + (dx * i) / steps, a.z + (dz * i) / steps)
    if (!isFree(cx, cz)) return false
  }
  return true
}

export function findPath(from, to) {
  let [sx, sz] = nearestFree(...toCell(from.x, from.z))
  let [tx, tz] = nearestFree(...toCell(to.x, to.z))
  if (sx === tx && sz === tz) return [{ x: to.x, z: to.z }]
  run++
  const start = sz * W + sx, goal = tz * W + tx
  const h = (x, z) => { const ax = Math.abs(x - tx), az = Math.abs(z - tz); return Math.max(ax, az) + 0.4142 * Math.min(ax, az) }
  const open = new Heap()
  stamp[start] = run; gScore[start] = 0; came[start] = -1
  open.push({ i: start, f: h(sx, sz) })
  let found = false, iter = 0
  while (open.size && iter++ < 40000) {
    const { i } = open.pop()
    if (i === goal) { found = true; break }
    const cx = i % W, cz = (i / W) | 0
    for (const [dx, dz, cost] of DIRS) {
      const nx = cx + dx, nz = cz + dz
      if (!isFree(nx, nz)) continue
      if (dx && dz && (!isFree(cx + dx, cz) || !isFree(cx, cz + dz))) continue
      const ni = nz * W + nx, g = gScore[i] + cost
      if (stamp[ni] !== run || g < gScore[ni]) {
        stamp[ni] = run; gScore[ni] = g; came[ni] = i
        open.push({ i: ni, f: g + h(nx, nz) })
      }
    }
  }
  if (!found) return [{ x: to.x, z: to.z }]
  const cells = []
  for (let i = goal; i !== -1; i = came[i]) cells.push(cellCenter(i % W, (i / W) | 0))
  cells.reverse()
  cells[cells.length - 1] = { x: to.x, z: to.z }
  // Suavização: remove pontos intermediários com linha de visão livre
  const out = []
  let anchor = { x: from.x, z: from.z }
  let k = 0
  while (k < cells.length) {
    let far = k
    for (let j = k + 1; j < cells.length; j++) { if (lineFree(anchor, cells[j])) far = j; else if (j - far > 3) break }
    out.push(cells[far])
    anchor = cells[far]
    k = far + 1
  }
  return out
}
