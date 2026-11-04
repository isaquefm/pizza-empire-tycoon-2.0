// Regras econômicas e modificadores derivados do estado do jogo.
// As fórmulas originais da versão 1.0 foram preservadas e estão marcadas.
import { RECIPES, INGREDIENT_RATIO } from '../../data/recipes'
import { INTERIOR_TABLES, MAX_TABLES } from '../../data/layout'

// --- Fórmulas originais (v1.0)
export const ovenUpgradeCost = (ovenLevel) => 90 * ovenLevel
export const speedUpgradeCost = (speedLevel) => 75 * speedLevel
export const expandCost = (tables) => 450 + tables * 150
export const franchiseCost = (franchises) => 1800 * (1 + franchises)
export const pizzaPrice = (recipe, ovenLevel) => recipe.price + ovenLevel * 3 // 18 + forno × 3
export const OFFLINE_RATE = 0.45 // por funcionário por segundo, até 4 h

// --- Progressão: 8 pedidos por nível até o nível 5 (original), depois cresce
export function levelForServed(served) {
  let level = 1, need = 0
  for (;;) {
    const step = level < 5 ? 8 : 8 + (level - 4) * 10
    if (served >= need + step) { need += step; level++ } else return level
  }
}
export function levelThreshold(level) {
  let need = 0
  for (let l = 1; l < level; l++) need += l < 5 ? 8 : 8 + (l - 4) * 10
  return need
}

export const marketingCost = (lvl) => 220 * (lvl + 1) * (lvl + 1)
export const reformCost = (lvl) => 600 * (lvl + 1)
export const MAX_REFORM = 3
export const MAX_MARKETING = 5

export const EXPANSIONS = [
  { id: 'kitchen', name: 'Ampliação da cozinha', price: 2000, level: 4, desc: 'Abre espaço para a 3ª bancada e o 3º forno.', benefit: 'Libera Bancada dupla e Terceiro forno' },
  { id: 'terrace', name: 'Varanda externa', price: 2500, level: 3, desc: 'Deck com guarda-sóis no lote ao lado: até 6 mesas extras.', benefit: '+6 vagas de mesas (12 lugares)' },
]

export function maxTables(state) {
  return state.expansions?.terrace ? MAX_TABLES : INTERIOR_TABLES
}

export function maxStaff(state) {
  return 3 + Math.floor(state.level / 2) + (state.expansions?.kitchen ? 2 : 0) + (state.expansions?.terrace ? 2 : 0)
}

export function getModifiers(s) {
  const o = s.owned || {}
  const ovens = 1 + (o.oven2 ? 1 : 0) + (o.oven3 ? 1 : 0)
  const prepStations = 1 + (o.prep2 ? 1 : 0) + (o.prep3 ? 1 : 0)
  const cond = s.condition ?? 100
  const wear = cond < 25 ? 1.45 : cond < 50 ? 1.2 : 1
  const comfort =
    (o.drink ? 5 : 0) + (o.music ? 4 : 0) + (o.heatlamp ? 4 : 0) + (o.booths ? 8 : 0) +
    (o.plants ? 3 : 0) + (o.paintings ? 3 : 0) + (o.lights ? 4 : 0) + (s.reformLevel || 0) * 5 +
    (cond < 25 ? -10 : 0)
  const patience = 1 + (o.booths ? 0.1 : 0) + (o.music ? 0.1 : 0) + (o.ac ? 0.25 : 0)
  const attraction =
    1 + (o.sign ? 0.12 : 0) + (o.paintings ? 0.05 : 0) + (s.marketingLevel || 0) * 0.12 +
    (s.reputation || 0) / 100 * 0.6 + (s.level || 1) * 0.03
  return {
    ovens,
    ovenSlots: ovens * 2,
    prepStations,
    prepTime: 3.9 * (o.shelves ? 0.85 : 1) * (o.mixer ? 0.8 : 1) * wear,
    bakeTime: 7 * Math.max(0.45, 1 - 0.07 * ((s.ovenLevel || 1) - 1)) * wear,
    registerTime: o.register ? 0.7 : 1,
    ingredientMult: o.fridge ? 0.8 : 1,
    walk: 1 + 0.06 * ((s.speedLevel || 1) - 1),
    comfort,
    patience,
    attraction,
    revenueMult: 1 + (s.franchises || 0) * 0.15,
    deliveryEnabled: (s.staff || []).some((m) => m.role === 'courier'),
  }
}

export const ingredientCost = (recipe, mods) => Math.round(recipe.price * INGREDIENT_RATIO * mods.ingredientMult)

export function operatingCost(s) {
  const m = getModifiers(s)
  return 20 + (s.tables || 2) * 3 + m.ovens * 8 + (s.owned?.ac ? 10 : 0) + (s.expansions?.terrace ? 15 : 0)
}

export const maintenanceCost = (s) => Math.round((100 - (s.condition ?? 100)) * 4 * getModifiers(s).ovens)

export const unlockedRecipes = (s) => RECIPES.filter((r) => (s.recipes || []).includes(r.id))
