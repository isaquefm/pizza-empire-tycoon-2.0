// IA dos clientes: chegada → fila → pedido → mesa → refeição → pagamento → saída.
import { world, uid, bump, setPath, stepMove, popup } from '../world'
import { DOOR_IN, DOOR_OUT, SPAWNS, queueSpot, QUEUE_MAX, REGISTER, PICKUP, paySpot, PAY_MAX } from '../../data/layout'
import { makeAppearance } from '../../characters/appearance'
import { randomName } from '../../data/staff'
import { cancelOrder } from '../Orders/orders'
import { pizzaPrice, ingredientCost, unlockedRecipes } from '../Economy/economy'
import { recipeById } from '../../data/recipes'

const SIDEWALK_Z = 7.45

function goRoute(e, points, then) {
  e.route = points.slice()
  e.then = then
  setPath(e, e.route.shift())
}

// Retorna true quando a rota termina
function followRoute(e, dt) {
  if (!e.route) return true
  if (stepMove(e, dt)) {
    if (e.route.length) { setPath(e, e.route.shift()); return false }
    const t = e.then
    e.route = null; e.then = null
    t?.()
    return true
  }
  return false
}

function chooseRecipe(s, budget) {
  const list = unlockedRecipes(s)
  if (!list.length) return recipeById('margherita')
  const affordable = list.filter((r) => pizzaPrice(r, s.ovenLevel) <= budget)
  const pool = affordable.length ? affordable : [list[0]]
  // peso maior para receitas mais elaboradas
  const weights = pool.map((r, i) => 1 + i * 0.6)
  let x = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < pool.length; i++) { x -= weights[i]; if (x <= 0) return pool[i] }
  return pool[pool.length - 1]
}

export function spawnCustomer(s, mods, { passerby = false } = {}) {
  const fromLeft = Math.random() < 0.5
  const start = fromLeft ? SPAWNS[0] : SPAWNS[1]
  const exit = fromLeft ? SPAWNS[1] : SPAWNS[0]
  const seed = Math.floor(Math.random() * 1e9)
  const app = makeAppearance(seed, 'customer')
  const budget = 20 + Math.random() * 45 + s.level * 4
  const recipe = chooseRecipe(s, budget)
  const c = {
    id: uid('c'), kind: 'customer', name: randomName(), appearance: app,
    x: start.x, z: start.z + (Math.random() - 0.5) * 0.5, rot: 0, targetRot: 0,
    speed: (1.25 + Math.random() * 0.35) * (app.kid ? 1.1 : app.elder ? 0.8 : 1),
    anim: 'walk', state: passerby ? 'passby' : 'arrive',
    maxPatience: (72 + Math.random() * 30) * mods.patience,
    patience: 1, money: Math.round(budget), recipe: recipe.id,
    price: Math.round(pizzaPrice(recipe, s.ovenLevel) * mods.revenueMult),
    cost: ingredientCost(recipe, mods), mood: 'happy', bubble: null, exit, sitT: 0,
  }
  world.customers.set(c.id, c)
  bump()
  if (passerby) goRoute(c, [{ x: exit.x, z: SIDEWALK_Z + (Math.random() - 0.5) * 0.6 }], () => despawn(c))
  else goRoute(c, [{ x: DOOR_OUT.x + (Math.random() - 0.5) * 0.6, z: SIDEWALK_Z }, DOOR_OUT, DOOR_IN], () => joinQueue(c, 'order'))
  return c
}

function despawn(c) {
  world.customers.delete(c.id)
  world.queue = world.queue.filter((id) => id !== c.id)
  world.payQueue = world.payQueue.filter((id) => id !== c.id)
  bump()
}

function joinQueue(c, purpose) {
  c.purpose = purpose
  c.state = 'queue'
  c.queueIdx = -1
  c.bubble = purpose === 'pay' ? 'pay' : 'order'
  const q = purpose === 'pay' ? world.payQueue : world.queue
  if (!q.includes(c.id)) q.push(c.id)
}

function leaveQueue(c) {
  world.queue = world.queue.filter((id) => id !== c.id)
  world.payQueue = world.payQueue.filter((id) => id !== c.id)
}

function exitRestaurant(c, happy) {
  c.state = 'leaving'
  c.bubble = happy ? 'happy' : 'angry'
  c.bubbleT = 3
  goRoute(c, [DOOR_IN, DOOR_OUT, { x: DOOR_OUT.x, z: SIDEWALK_Z }, { x: c.exit.x, z: SIDEWALK_Z }], () => despawn(c))
}

export function leaveAngry(c, api) {
  leaveQueue(c)
  if (c.seat) { c.seat.occupant = null; c.seat = null }
  const o = c.orderId && world.orders.get(c.orderId)
  if (o) {
    if (o.status !== 'queued') api.chargeIngredients(c.cost) // desperdício
    cancelOrder(o)
  }
  c.mood = 'angry'
  api.customerLost()
  popup(c.x, c.z, '−2 reputação', '#d64545')
  exitRestaurant(c, false)
}

// Chamado pelo caixa após anotar o pedido
export function customerOrdered(c, order) {
  leaveQueue(c)
  c.orderId = order.id
  c.handler = null
  const seat = world.seats.find((s) => !s.occupant && !s.dirty)
  c.bubble = 'wait'
  if (seat) {
    seat.occupant = c.id
    c.seat = seat
    c.state = 'toSeat'
    goRoute(c, [seat.approach], () => { c.state = 'sitting'; c.sitT = 0 })
  } else {
    c.takeaway = true
    const used = new Set([...world.customers.values()].filter((x) => x.state === 'pickupWait' || x.state === 'toPickup').map((x) => x.waitIdx))
    let idx = PICKUP.wait.findIndex((_, i) => !used.has(i))
    if (idx < 0) idx = Math.floor(Math.random() * PICKUP.wait.length)
    c.waitIdx = idx
    c.state = 'toPickup'
    const p = PICKUP.wait[idx]
    goRoute(c, [p], () => { c.state = 'pickupWait'; c.targetRot = Math.PI })
  }
}

// Chamado pelo garçom ao servir
export function customerServed(c) {
  c.bubble = 'eat'
  c.patienceAtServe = c.patience
  if (c.takeaway) {
    c.carry = 'box'
    joinQueue(c, 'pay')
  } else {
    c.state = 'eating'
    c.eatT = 8 + Math.random() * 4
    if (c.seat) c.seat.food = c.recipe
  }
}

// Chamado pelo caixa ao receber
export function customerPaid(c, s, mods, api) {
  leaveQueue(c)
  c.handler = null
  const p = c.patienceAtServe ?? c.patience
  const sat = Math.max(5, Math.min(100, Math.round(38 + p * 42 + mods.comfort + Math.min(12, s.ovenLevel * 2))))
  const tip = sat >= 85 ? Math.round(c.price * 0.15) : sat >= 70 ? Math.round(c.price * 0.06) : 0
  api.chargeIngredients(c.cost)
  api.completeSale({ amount: c.price, tip, satisfaction: sat })
  c.sat = sat
  c.mood = sat >= 60 ? 'happy' : sat >= 40 ? 'neutral' : 'impatient'
  c.carry = null
  popup(REGISTER.x, REGISTER.customer.z, `+R$ ${c.price + tip}${tip ? ' ♥' : ''}`, '#2f9e5b')
  exitRestaurant(c, sat >= 50)
}

const PATIENCE_RATE = { queue: 1, atCounter: 1, toSeat: 0.6, sitting: 0.6, seated: 0.75, toPickup: 0.8, pickupWait: 0.8 }

export function updateCustomer(c, dt, ctx) {
  const { api } = ctx
  if (c.bubbleT) { c.bubbleT -= dt; if (c.bubbleT <= 0) { c.bubbleT = 0; if (c.state === 'leaving') c.bubble = null } }

  // Paciência
  const paying = c.purpose === 'pay' && (c.state === 'queue' || c.state === 'atPay')
  const rate = paying ? 0 : PATIENCE_RATE[c.state]
  if (paying) {
    c.patience = Math.max(0.05, c.patience - (0.25 * dt) / c.maxPatience)
  } else if (rate) {
    c.patience -= (rate * dt) / c.maxPatience
    c.mood = c.patience > 0.6 ? 'happy' : c.patience > 0.3 ? 'neutral' : 'impatient'
    if (c.patience <= 0) { c.patience = 0; leaveAngry(c, api); return }
  }

  switch (c.state) {
    case 'arrive': case 'passby': case 'leaving': case 'toSeat': case 'toPickup':
      followRoute(c, dt)
      break
    case 'queue': {
      const pay = c.purpose === 'pay'
      const idx = (pay ? world.payQueue : world.queue).indexOf(c.id)
      if (idx < 0) { joinQueue(c, c.purpose); break }
      if (idx !== c.queueIdx) {
        c.queueIdx = idx
        const spot = pay ? paySpot(Math.min(idx, PAY_MAX)) : idx === 0 ? REGISTER.customer : queueSpot(Math.min(idx, QUEUE_MAX + 1))
        c.route = null
        setPath(c, spot)
      }
      if (stepMove(c, dt)) {
        c.anim = 'idle'
        c.targetRot = idx === 0 || pay ? Math.PI : Math.PI / 2
        if (idx === 0) c.state = c.purpose === 'pay' ? 'atPay' : 'atCounter'
      }
      break
    }
    case 'atCounter': case 'atPay':
      c.anim = 'idle'; c.targetRot = Math.PI
      break
    case 'sitting': {
      // desliza da posição de aproximação até a cadeira
      const s = c.seat
      if (!s) { c.state = 'seated'; break }
      c.sitT += dt * 2.6
      const t = Math.min(1, c.sitT)
      c.x += (s.x - c.x) * t; c.z += (s.z - c.z) * t
      c.targetRot = s.rot
      c.anim = 'sit'
      if (t >= 1) c.state = 'seated'
      break
    }
    case 'seated':
      c.anim = 'sit'
      if (c.seat) c.targetRot = c.seat.rot
      break
    case 'pickupWait':
      c.anim = 'idle'
      break
    case 'eating':
      c.anim = 'eat'
      c.eatT -= dt
      if (c.eatT <= 0) {
        const s = c.seat
        if (s) { s.dirty = true; s.food = 'empty'; s.occupant = null; c.x = s.approach.x; c.z = s.approach.z }
        c.seat = null
        joinQueue(c, 'pay')
      }
      break
    default:
      break
  }
}

export function queueCapacityOk() {
  return world.queue.length < QUEUE_MAX
}
