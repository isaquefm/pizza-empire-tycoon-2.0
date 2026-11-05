// Orquestrador: avança clientes, funcionários, fornos e relógio do jogo.
// Chamado uma vez por quadro pelo canvas 3D (GameLoop).
import { useGame, OPEN_HOUR, CLOSE_HOUR, OWNER_MEMBER } from './store'
import { world, bump, resetWorld, lerpAngle } from './world'
import { buildGrid } from './Navigation/pathfinding'
import { buildObstacles, seatsForTable, TABLE_SLOTS, QUEUE_MAX } from '../data/layout'
import { getModifiers, pizzaPrice, ingredientCost, unlockedRecipes } from './Economy/economy'
import { syncStations, updateOvens, createOrder } from './Orders/orders'
import { spawnCustomer, updateCustomer } from './CustomerAI/customerAI'
import { spawnWorker, removeWorker, assignTasks, updateWorker } from './Employees/workerAI'

export const SECONDS_PER_GAME_MINUTE = 0.35
const MAX_CUSTOMERS = { alta: 30, media: 22, baixa: 14 }

let navKey = null
let franchiseKey = null
let pendingMinutes = 0
let publishT = 0
let lastVersion = -1
let assignT = 0

export const CUSTOMER_STATE_LABEL = {
  arrive: 'Chegando', queue: 'Na fila', atCounter: 'Fazendo pedido', toSeat: 'Indo à mesa', sitting: 'Sentando',
  seated: 'Aguardando pizza', eating: 'Comendo', atPay: 'Pagando', toPickup: 'Aguardando retirada', pickupWait: 'Aguardando retirada',
  leaving: 'Saindo', passby: 'Passando',
}

function sync(st, mods) {
  const unitKey = `${st.franchises}:${st.runId}`
  if (franchiseKey !== unitKey) {
    if (franchiseKey !== null) { resetWorld(); pendingMinutes = 0 }
    franchiseKey = unitKey
    navKey = null
  }
  const key = st.expansions.terrace ? 'terrace' : 'base'
  if (key !== navKey) { buildGrid(buildObstacles({ terrace: !!st.expansions.terrace })); navKey = key }

  const wantSeats = Math.min(st.tables, TABLE_SLOTS.length) * 2
  if (world.seats.length > wantSeats) world.seats.length = wantSeats
  while (world.seats.length < wantSeats) {
    const t = Math.floor(world.seats.length / 2)
    const s = seatsForTable(t)[world.seats.length % 2]
    world.seats.push({ id: `seat${world.seats.length}`, table: t, tableX: TABLE_SLOTS[t].x, ...s, occupant: null, dirty: false, food: null, cleaner: null })
  }
  syncStations(mods)

  // Funcionários ↔ entidades
  const members = [OWNER_MEMBER, ...st.staff]
  const byStaff = new Map([...world.workers.values()].map((w) => [w.staffId, w]))
  const roleCount = {}
  for (const m of members) {
    roleCount[m.role] = (roleCount[m.role] || 0) + 1
    const w = byStaff.get(m.id)
    if (!w) spawnWorker(m, roleCount[m.role] - 1)
    else { w.member = m; w.idx = roleCount[m.role] - 1 }
  }
  const ids = new Set(members.map((m) => m.id))
  for (const w of world.workers.values()) if (!ids.has(w.staffId)) removeWorker(w)
}

const isOpen = (clock) => clock >= OPEN_HOUR * 60 && clock < CLOSE_HOUR * 60 - 30

function rush(clock) {
  const h = clock / 60
  if (h >= 11.5 && h < 14) return 1.6
  if (h >= 19 && h < 21) return 1.5
  if (h >= 15 && h < 17.5) return 0.75
  return 1
}

function step(dt, st, mods) {
  const api = st
  const ctx = { st, state: st, mods, api }
  const clock = st.clock + pendingMinutes
  world.boost = Math.max(0, world.boost - dt)

  // Chegada de clientes
  const present = [...world.customers.values()].filter((c) => c.state !== 'passby').length
  const cap = Math.min(MAX_CUSTOMERS[st.settings.quality] || 26, world.seats.length + 3 + Math.min(4, st.staff.length))
  // o movimento cresce com a capacidade de atendimento (equipe)
  const power = (role) => st.staff.filter((m) => m.role === role).reduce((a, m) => a + (m.eff || 1) * (1 + 0.1 * (m.level - 1)), 0)
  const kitchen = 1 + power('chef') * 1.1 + (mods.prepStations - 1) * 0.25
  const service = 1 + (power('waiter') + power('cashier')) * 0.8
  const workforce = Math.min(kitchen, service)
  const backlog = [...world.orders.values()].filter((o) => o.status === 'queued' && !o.delivery).length
  world.spawnTimer -= dt
  if (world.spawnTimer <= 0) {
    world.spawnTimer = Math.max(2.4, (22 / (workforce * mods.attraction * rush(clock))) * (0.7 + Math.random() * 0.6))
    if (isOpen(clock) && present < cap) {
      // cozinha lotada ou fila cheia: o pedestre olha e segue caminho
      const fullQueue = world.queue.length >= QUEUE_MAX || backlog > mods.prepStations + 2
      spawnCustomer(st, mods, { passerby: fullQueue })
    }
  }
  // Pedestres de ambiente
  world.ambientTimer = (world.ambientTimer ?? 4) - dt
  if (world.ambientTimer <= 0) {
    world.ambientTimer = 5 + Math.random() * 8
    const passers = [...world.customers.values()].filter((c) => c.state === 'passby').length
    if (passers < 3 && world.customers.size < cap + 3) spawnCustomer(st, mods, { passerby: true })
  }

  // Pedidos de delivery
  const couriers = st.staff.filter((m) => m.role === 'courier').length
  if (couriers && isOpen(clock)) {
    world.deliveryTimer -= dt
    if (world.deliveryTimer <= 0) {
      world.deliveryTimer = ((16 + Math.random() * 14) / mods.attraction) * mods.deliveryInterval
      const pending = [...world.orders.values()].filter((o) => o.delivery).length
      if (pending < couriers * 2) {
        const list = unlockedRecipes(st)
        const r = list[Math.floor(Math.random() * list.length)] || list[0]
        if (r) {
          const o = createOrder({ recipe: r.id, price: Math.round(pizzaPrice(r, st.ovenLevel) * mods.revenueMult), delivery: true })
          o.cost = ingredientCost(r, mods)
        }
      }
    }
  }

  updateOvens(dt, mods)

  assignT -= dt
  if (assignT <= 0) { assignTasks(ctx); assignT = 0.2 }

  const k = 1 - Math.exp(-dt * 10)
  for (const w of world.workers.values()) { updateWorker(w, dt, ctx); w.rot = lerpAngle(w.rot, w.targetRot, k) }
  for (const c of [...world.customers.values()]) { updateCustomer(c, dt, ctx); c.rot = lerpAngle(c.rot, c.targetRot, k) }

  for (const p of world.popups) p.t += dt
  world.popups = world.popups.filter((p) => p.t < 2.2)

  pendingMinutes += dt / SECONDS_PER_GAME_MINUTE
}

function closeDayIfNeeded(st) {
  const clock = st.clock + pendingMinutes
  if (clock < CLOSE_HOUR * 60) return false
  const inside = [...world.customers.values()].filter((c) => c.state !== 'passby').length
  const riding = [...world.workers.values()].some((w) => w.ride)
  if ((inside === 0 && !riding) || clock >= CLOSE_HOUR * 60 + 90) {
    // Fecha as portas: quem ainda estiver dentro vai embora sem penalidade
    for (const c of [...world.customers.values()]) if (c.state !== 'passby') world.customers.delete(c.id)
    world.queue = []
    world.payQueue = []
    world.orders.clear()
    world.seats.forEach((s) => { s.occupant = null; s.dirty = false; s.food = null; s.cleaner = null })
    world.ovens.forEach((s) => { s.order = null; s.reserved = null })
    world.pickup.forEach((s) => { s.order = null; s.reserved = null })
    world.prep.forEach((s) => { s.user = null; s.order = null })
    world.registerUser = null
    for (const w of world.workers.values()) { w.task = null; w.steps = []; w.carry = null; w.hidden = false; w.ride = null }
    bump()
    pendingMinutes = 0
    st.endDay()
    return true
  }
  return false
}

function publish() {
  const customers = [...world.customers.values()].filter((c) => c.state !== 'passby')
  const orders = [...world.orders.values()]
  const workers = {}
  for (const w of world.workers.values()) workers[w.staffId] = { label: w.label, progress: w.progress || 0, id: w.id }
  const live = {
    inside: customers.length,
    queue: world.queue.length + world.payQueue.length,
    waitingFood: customers.filter((c) => c.state === 'seated' || c.state === 'pickupWait').length,
    queued: orders.filter((o) => o.status === 'queued').length,
    preparing: orders.filter((o) => o.status === 'prep' || o.status === 'toOven').length,
    baking: orders.filter((o) => o.status === 'baking' || o.status === 'baked').length,
    ready: orders.filter((o) => o.status === 'ready' || o.status === 'finishing').length,
    activeOrders: orders.length,
    delivery: orders.filter((o) => o.delivery).length,
    seats: world.seats.length,
    seatsFree: world.seats.filter((s) => !s.occupant).length,
    dirty: world.seats.filter((s) => s.dirty).length,
    ovenSlots: world.ovens.length,
    ovenBusy: world.ovens.filter((s) => s.order).length,
    customers: customers.slice(0, 16).map((c) => ({ id: c.id, name: c.name, state: c.state, patience: c.patience, mood: c.mood, recipe: c.recipe, price: c.price, money: c.money, takeaway: !!c.takeaway })),
    orders: orders.slice(0, 12).map((o) => ({ id: o.id, recipe: o.recipe, status: o.status, delivery: o.delivery, bake: o.bakeTotal ? o.bakeT / o.bakeTotal : 0 })),
    workers,
    deliveriesOut: [...world.workers.values()].filter((w) => w.ride).length,
  }
  const patch = { live, clock: useGame.getState().clock + pendingMinutes }
  pendingMinutes = 0
  if (world.version !== lastVersion) {
    lastVersion = world.version
    patch.entities = [
      ...[...world.workers.values()].map((w) => ({ id: w.id, kind: 'worker' })),
      ...[...world.customers.values()].map((c) => ({ id: c.id, kind: 'customer' })),
    ]
  }
  useGame.setState(patch)
}

export function stepSimulation(realDt) {
  const st = useGame.getState()
  const mods = getModifiers(st)
  sync(st, mods)
  if (!st.paused) {
    const total = Math.min(realDt, 0.1) * st.speed
    const n = Math.max(1, Math.ceil(total / 0.04))
    for (let i = 0; i < n; i++) step(total / n, st, mods)
    closeDayIfNeeded(useGame.getState())
  }
  publishT -= realDt
  if (publishT <= 0) { publishT = 0.25; publish(); useGame.getState().checkGoals() }
}

// Ajuda manual do gerente: acelera a cozinha por alguns segundos
export function kitchenBoost() {
  if (world.boost > 0.5) return false
  world.boost = 4
  return true
}

export function getEntity(id) {
  return world.workers.get(id) || world.customers.get(id)
}
