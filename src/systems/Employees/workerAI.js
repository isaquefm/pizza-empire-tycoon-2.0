// IA dos funcionários: cada tarefa é uma sequência de passos
// (mover, trabalhar, aguardar, executar) com reservas de estações.
import { world, uid, bump, setPath, stepMove, popup } from '../world'
import { makeAppearance } from '../../characters/appearance'
import { REGISTER, KITCHEN, PICKUP, DOOR_IN, DOOR_OUT, SCOOTER } from '../../data/layout'
import { createOrder, removeOrder, freeOvenSlot, freePickupSlot, freePrepStation } from '../Orders/orders'
import { customerOrdered, customerServed, customerPaid } from '../CustomerAI/customerAI'
import { recipeById } from '../../data/recipes'
import { sfx } from '../audio'

const BACK = Math.PI // virado para a parede do fundo (−z)
const FRONT = 0 // virado para o salão (+z)

export const IDLE_SPOTS = {
  owner: [{ x: -0.3, z: -3.35 }],
  cashier: [{ x: REGISTER.staff.x, z: REGISTER.staff.z }, { x: -2.3, z: -3.4 }],
  chef: [{ x: -2.6, z: -3.7 }, { x: -1.2, z: -3.8 }, { x: 0.2, z: -3.9 }, { x: -3.9, z: -3.8 }, { x: 1.5, z: -3.7 }],
  waiter: [{ x: 4.6, z: -1.0 }, { x: 5.4, z: -0.4 }, { x: 4.4, z: 0.0 }, { x: 6.2, z: -1.1 }],
  courier: [{ x: 6.9, z: -1.3 }, { x: 7.2, z: -0.4 }, { x: 6.6, z: -0.2 }],
}

export function spawnWorker(member, index) {
  const role = member.role
  const app = makeAppearance(member.seed, role)
  const spot = IDLE_SPOTS[role][index % IDLE_SPOTS[role].length]
  const w = {
    id: uid('w'), kind: 'worker', staffId: member.id, member, role, name: member.name, appearance: app,
    x: role === 'owner' ? spot.x : DOOR_IN.x, z: role === 'owner' ? spot.z : DOOR_IN.z,
    rot: FRONT, targetRot: FRONT, speed: 1.6, anim: 'idle', steps: [], task: null, label: 'Ocioso',
    carry: null, hidden: false, idx: index, ride: null,
  }
  world.workers.set(w.id, w)
  bump()
  return w
}

export function removeWorker(w) {
  abortTask(w)
  world.workers.delete(w.id)
  bump()
}

function abortTask(w) {
  if (w.task?.cleanup) w.task.cleanup()
  w.task = null
  w.steps = []
  w.carry = null
  w.hidden = false
  w.ride = null
}

const move = (to, face, label) => ({ t: 'move', to, face, label })
const work = (dur, anim, label, done, face) => ({ t: 'work', dur, anim, label, done, face })
const wait = (until, label, anim = 'idle') => ({ t: 'wait', until, label, anim })
const run = (fn) => ({ t: 'do', fn })

// ------------------------------------------------------------- Tarefas
function taskTakeOrder(w, ctx) {
  if (world.registerUser && world.registerUser !== w.id) return null
  const c = [...world.customers.values()].find((x) => x.state === 'atCounter' && !x.handler)
  if (!c) return null
  c.handler = w.id
  world.registerUser = w.id
  return {
    name: 'takeOrder',
    valid: () => world.customers.has(c.id) && c.state === 'atCounter',
    cleanup: () => { if (world.registerUser === w.id) world.registerUser = null; if (c.handler === w.id) c.handler = null },
    steps: [
      move(REGISTER.staff, FRONT, 'Indo ao caixa'),
      work(3.0 * ctx.mods.registerTime, 'register', 'Anotando pedido', () => {
        const recipe = recipeById(c.recipe)
        const o = createOrder({ recipe: recipe.id, price: c.price, customerId: c.id })
        customerOrdered(c, o)
      }, FRONT),
      run(() => { if (world.registerUser === w.id) world.registerUser = null }),
    ],
  }
}

function taskPayment(w, ctx) {
  if (world.registerUser && world.registerUser !== w.id) return null
  const c = [...world.customers.values()].find((x) => x.state === 'atPay' && !x.handler)
  if (!c) return null
  c.handler = w.id
  world.registerUser = w.id
  return {
    name: 'payment',
    valid: () => world.customers.has(c.id) && c.state === 'atPay',
    cleanup: () => { if (world.registerUser === w.id) world.registerUser = null; if (c.handler === w.id) c.handler = null },
    steps: [
      move(REGISTER.staff, FRONT, 'Indo ao caixa'),
      work(2.2 * ctx.mods.registerTime, 'register', 'Recebendo pagamento', () => customerPaid(c, ctx.state, ctx.mods, ctx.api), FRONT),
      run(() => { if (world.registerUser === w.id) world.registerUser = null }),
    ],
  }
}

function taskCook(w, ctx) {
  const station = freePrepStation()
  if (!station) return null
  const o = [...world.orders.values()].find((x) => x.status === 'queued' && !x.cancelled)
  if (!o) return null
  station.user = w.id
  station.order = o.id
  o.status = 'prep'
  o.chef = w.id
  const recipe = recipeById(o.recipe)
  let slot = null
  return {
    name: 'cook',
    valid: () => world.orders.has(o.id) && !(o.cancelled && (o.status === 'prep' || o.status === 'toOven')),
    cleanup: () => {
      if (station.user === w.id) { station.user = null; station.order = null }
      if (slot && slot.reserved === w.id) slot.reserved = null
      if (world.orders.has(o.id) && (o.status === 'prep' || o.status === 'toOven')) {
        if (o.cancelled) removeOrder(o); else { o.status = 'queued'; o.chef = null }
      }
    },
    steps: [
      move(KITCHEN.fridge.front, BACK, 'Buscando ingredientes'),
      work(0.6, 'grab', 'Pegando ingredientes', () => { w.carry = 'dough' }, BACK),
      move(station.front, BACK, 'Indo à bancada'),
      work(ctx.mods.prepTime * recipe.prep, 'knead', `Montando ${recipe.name}`, () => {
        station.user = null; station.order = null; o.status = 'toOven'; w.carry = 'raw'
      }, BACK),
      wait(() => { slot = freeOvenSlot(); if (slot) { slot.reserved = w.id; return true } return false }, 'Aguardando forno livre'),
      move(() => slot.front, BACK, 'Levando ao forno'),
      work(0.8, 'oven', 'Colocando no forno', () => {
        slot.order = o.id; slot.reserved = null; o.oven = slot; o.status = 'baking'; o.bakeT = 0; w.carry = null
        ctx.api.wearEquipment(0.35 * ctx.mods.wearMult)
        sfx('oven')
      }, BACK),
    ],
  }
}

function taskUnload(w) {
  const o = [...world.orders.values()].find((x) => x.status === 'baked' && !x.unloader)
  if (!o) return null
  o.unloader = w.id
  let slot = null
  return {
    name: 'unload',
    valid: () => world.orders.has(o.id),
    cleanup: () => {
      if (slot && slot.reserved === w.id) slot.reserved = null
      if (!world.orders.has(o.id)) return
      if (o.status === 'baked') o.unloader = null
      else if (o.status === 'finishing') removeOrder(o)
    },
    steps: [
      move(o.oven.front, BACK, 'Indo ao forno'),
      work(0.7, 'oven', 'Retirando do forno', () => {
        if (o.oven) { o.oven.order = null; o.oven = null }
        o.status = 'finishing'; w.carry = 'pizza'
        if (o.cancelled) { removeOrder(o); w.carry = null; w.steps = [] }
      }, BACK),
      wait(() => { slot = freePickupSlot(); if (slot) { slot.reserved = w.id; return true } return false }, 'Aguardando espaço na retirada'),
      move(() => ({ x: slot.x, z: -3.05 }), FRONT, 'Levando à finalização'),
      work(1.0, 'cut', 'Cortando e finalizando', () => {
        slot.order = o.id; slot.reserved = null; o.slot = slot; o.status = 'ready'; w.carry = null
      }, FRONT),
    ],
  }
}

function taskServe(w, ctx) {
  const o = [...world.orders.values()].find((x) => {
    if (x.status !== 'ready' || x.delivery || x.server) return false
    const c = world.customers.get(x.customerId)
    return c && (c.state === 'seated' || c.state === 'pickupWait' || c.state === 'sitting')
  })
  if (!o) {
    // pedidos de clientes que foram embora: descarta
    for (const x of world.orders.values()) if (x.status === 'ready' && !x.delivery && !world.customers.has(x.customerId)) removeOrder(x)
    return null
  }
  const c = world.customers.get(o.customerId)
  o.server = w.id
  o.status = 'serving'
  const slot = o.slot
  const target = () => c.takeaway ? { x: c.x + 0.1, z: c.z - 0.75 } : c.seat ? c.seat.approach : { x: c.x, z: c.z + 0.7 }
  return {
    name: 'serve',
    valid: () => world.customers.has(c.id) && c.state !== 'leaving' && world.orders.has(o.id),
    cleanup: () => {
      if (!world.orders.has(o.id)) return
      if (w.carry === 'tray') removeOrder(o)
      else { o.server = null; o.status = 'ready' }
    },
    steps: [
      move({ x: slot.x, z: -1.5 }, BACK, 'Indo à retirada'),
      work(0.5, 'grab', 'Pegando pizza', () => { if (slot.order === o.id) slot.order = null; o.slot = null; w.carry = 'tray'; w.carryRecipe = o.recipe }, BACK),
      move(target, null, c.takeaway ? 'Entregando para viagem' : 'Levando à mesa'),
      work(0.7, 'serve', 'Servindo cliente', () => { customerServed(c); removeOrder(o); w.carry = null },
        () => c.seat ? Math.atan2(c.seat.x - w.x, c.seat.z - w.z) : Math.atan2(c.x - w.x, c.z - w.z)),
    ],
  }
}

function taskClean(w) {
  const seat = world.seats.find((s) => s.dirty && !s.cleaner && !s.occupant)
  if (!seat) return null
  seat.cleaner = w.id
  return {
    name: 'clean',
    valid: () => seat.dirty,
    cleanup: () => { if (seat.cleaner === w.id) seat.cleaner = null },
    steps: [
      move(seat.approach, null, 'Indo limpar mesa'),
      work(1.6, 'wipe', 'Limpando mesa', () => { seat.dirty = false; seat.food = null; seat.cleaner = null },
        () => Math.atan2(seat.tableX - w.x, seat.z - w.z)),
    ],
  }
}

function taskDeliver(w, ctx) {
  const o = [...world.orders.values()].find((x) => x.status === 'ready' && x.delivery && !x.server)
  if (!o) return null
  o.server = w.id
  o.status = 'serving'
  const slot = o.slot
  const park = { x: SCOOTER.x + (w.idx % 3) * 1.25, z: SCOOTER.z }
  const dur = (13 + Math.random() * 7) / (w.member.speed || 1)
  return {
    name: 'deliver',
    valid: () => true,
    cleanup: () => {
      if (!world.orders.has(o.id)) return
      if (w.carry) removeOrder(o)
      else { o.server = null; o.status = 'ready' }
    },
    steps: [
      move({ x: slot.x, z: -1.5 }, BACK, 'Retirando delivery'),
      work(0.5, 'grab', 'Guardando na mochila térmica', () => { if (slot.order === o.id) slot.order = null; o.slot = null; w.carry = 'box' }, BACK),
      move(DOOR_IN, null, 'Saindo para entrega'),
      move(DOOR_OUT, null, 'Saindo para entrega'),
      move(park, Math.PI / 2, 'Indo à scooter'),
      run(() => { w.hidden = true; w.ride = { t: 0, dur, park } }),
      { t: 'ride', label: 'Em rota de entrega' },
      run(() => {
        w.hidden = false; w.ride = null; w.carry = null
        const fee = 6
        ctx.api.chargeIngredients(o.cost || 0)
        ctx.api.completeSale({ amount: o.price + fee, tip: Math.random() < 0.4 ? 3 : 0, satisfaction: 80, delivery: true, recipe: o.recipe })
        popup(park.x, park.z, `+R$ ${o.price + fee} delivery`, '#2f9e5b')
        removeOrder(o)
      }),
      move(DOOR_OUT, null, 'Voltando'),
      move(DOOR_IN, null, 'Voltando'),
    ],
  }
}

const ROLE_TASKS = {
  cashier: [taskPayment, taskTakeOrder],
  chef: [taskUnload, taskCook],
  waiter: [taskServe, taskClean],
  courier: [taskDeliver],
  owner: [taskPayment, taskUnload, taskServe, taskTakeOrder, taskCook, taskClean],
}

// Quando há funcionários dedicados livres, o gerente só ajuda se a tarefa sobrar
export function assignTasks(ctx) {
  const order = [...world.workers.values()].sort((a, b) => (a.role === 'owner') - (b.role === 'owner'))
  for (const w of order) {
    if (w.task) continue
    for (const fn of ROLE_TASKS[w.role]) {
      const t = fn(w, ctx)
      if (t) { w.task = t; w.steps = t.steps.slice(); break }
    }
  }
}

export function updateWorker(w, dt, ctx) {
  const m = w.member
  const lvl = 1 + 0.1 * ((m.level || 1) - 1)
  w.speed = 1.7 * (m.speed || 1) * lvl * ctx.mods.walk
  const workRate = (m.eff || 1) * (1 + 0.08 * ((m.level || 1) - 1)) * (1 + 0.03 * ((ctx.state.speedLevel || 1) - 1)) * (world.boost > 0 ? 1.6 : 1)

  if (w.task && w.task.valid && !w.task.valid()) abortTask(w)

  const s = w.steps[0]
  if (!s) {
    if (w.task) w.task = null
    // ocioso: volta ao posto
    const spot = IDLE_SPOTS[w.role][w.idx % IDLE_SPOTS[w.role].length]
    if (!w.idleTarget || w.idleTarget !== spot) { w.idleTarget = spot; setPath(w, spot) }
    if (stepMove(w, dt)) {
      w.anim = w.role === 'cashier' ? 'idleCounter' : 'idle'
      w.targetRot = FRONT
      w.label = 'Aguardando tarefas'
    } else w.label = 'Voltando ao posto'
    w.progress = 0
    return
  }
  w.idleTarget = null
  w.label = s.label || w.label
  switch (s.t) {
    case 'move': {
      if (!s.started) { s.started = true; setPath(w, typeof s.to === 'function' ? s.to() : s.to) }
      if (stepMove(w, dt)) { if (s.face != null) w.targetRot = s.face; w.steps.shift(); w.anim = 'idle' }
      break
    }
    case 'work': {
      w.anim = s.anim
      if (s.face != null) w.targetRot = typeof s.face === 'function' ? s.face() : s.face
      s.el = (s.el || 0) + dt * workRate
      w.progress = Math.min(1, s.el / s.dur)
      if (s.el >= s.dur) { w.steps.shift(); w.progress = 0; s.done?.(w) }
      break
    }
    case 'wait': {
      w.anim = s.anim
      if (s.until()) w.steps.shift()
      break
    }
    case 'do': w.steps.shift(); s.fn(w); break
    case 'ride': {
      w.ride.t += dt
      w.progress = w.ride.t / w.ride.dur
      if (w.ride.t >= w.ride.dur) w.steps.shift()
      break
    }
    default: w.steps.shift()
  }
}
