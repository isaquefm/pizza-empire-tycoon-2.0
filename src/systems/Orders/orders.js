// Pedidos: fila → preparo → forno → finalização → retirada → entrega.
import { world, uid } from '../world'
import { OVENS, PICKUP, PREP_STATIONS } from '../../data/layout'

export const ORDER_LABEL = {
  queued: 'Na fila', prep: 'Em preparo', toOven: 'Indo ao forno', baking: 'No forno',
  baked: 'Assado', finishing: 'Finalizando', ready: 'Pronto p/ retirada', serving: 'A caminho', done: 'Entregue',
}

export function createOrder({ recipe, price, customerId = null, delivery = false }) {
  const o = { id: uid('o'), recipe, price, customerId, delivery, status: 'queued', bakeT: 0, slot: null, oven: null, created: performance.now() }
  world.orders.set(o.id, o)
  return o
}

export function cancelOrder(o) {
  if (!o) return
  o.cancelled = true
  if (o.status === 'queued') world.orders.delete(o.id)
}

export function removeOrder(o) {
  if (o.oven) { const slot = o.oven; if (slot.order === o.id) slot.order = null }
  world.pickup.forEach((p) => { if (p.order === o.id) p.order = null })
  world.orders.delete(o.id)
}

// Sincroniza estações com a quantidade comprada
export function syncStations(mods) {
  while (world.prep.length < mods.prepStations) {
    const i = world.prep.length
    world.prep.push({ i, ...PREP_STATIONS[i], user: null, order: null })
  }
  world.prep.length = Math.min(world.prep.length, mods.prepStations)
  const slots = mods.ovens * 2
  while (world.ovens.length < slots) {
    const i = world.ovens.length, oven = OVENS[Math.floor(i / 2)]
    world.ovens.push({ i, ovenIndex: Math.floor(i / 2), ...oven, order: null, reserved: null, fire: 0 })
  }
  world.ovens.length = Math.min(world.ovens.length, slots)
  if (!world.pickup.length) PICKUP.slots.forEach((p, i) => world.pickup.push({ i, ...p, order: null, reserved: null }))
}

export function updateOvens(dt, mods, onBaked) {
  for (const slot of world.ovens) {
    const o = slot.order && world.orders.get(slot.order)
    slot.fire += ((o ? 1 : 0.35) - slot.fire) * Math.min(1, dt * 2)
    if (!o || o.status !== 'baking') continue
    o.bakeT += dt * (1 + (world.boost > 0 ? 1.5 : 0))
    o.bakeTotal = mods.bakeTime
    if (o.bakeT >= mods.bakeTime) { o.status = 'baked'; onBaked?.(o) }
  }
}

export const freeOvenSlot = () => world.ovens.find((s) => !s.order && !s.reserved)
export const freePickupSlot = () => world.pickup.find((s) => !s.order && !s.reserved)
export const freePrepStation = () => world.prep.find((s) => !s.user)
