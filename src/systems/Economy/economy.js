// Regras econômicas e modificadores derivados do estado do jogo.
// As fórmulas originais da versão 1.0 foram preservadas e estão marcadas.
import { RECIPES, INGREDIENT_RATIO } from '../../data/recipes'
import { INTERIOR_TABLES, MAX_TABLES } from '../../data/layout'
import { SHOP_ITEMS, COLLECTIONS, itemFx, collectionDone } from '../../data/shopItems'
import { PERKS, perkValue } from '../../data/staff'
import { eventById } from '../../data/events'

// --- Fórmulas originais (v1.0)
export const ovenUpgradeCost = (ovenLevel) => 90 * ovenLevel
export const speedUpgradeCost = (speedLevel) => 75 * speedLevel
export const expandCost = (tables) => 450 + tables * 150
export const pizzaPrice = (recipe, ovenLevel) => recipe.price + ovenLevel * 3 // 18 + forno × 3

// --- Franquia: bônus permanente, então exige uma unidade bem desenvolvida
export const franchiseCost = (franchises) => 8000 * (1 + franchises)
export const franchiseReq = (franchises) => ({ level: 8, served: 120 + franchises * 60 })
export function canFranchise(s) {
  const req = franchiseReq(s.franchises || 0)
  return s.level >= req.level && s.served >= req.served
}

// --- Renda offline: até um dia de lucro médio (recebido por inteiro após 4 h fora)
const OFFLINE_FULL_SECONDS = 4 * 3600
const OFFLINE_FALLBACK_PER_STAFF = 30
export function offlineIncome(s, elapsedSeconds) {
  if (!s.staff?.length) return 0
  const recent = (s.history || []).slice(-3)
  const dayProfit = recent.length
    ? Math.max(0, recent.reduce((a, d) => a + d.profit, 0) / recent.length)
    : s.staff.length * OFFLINE_FALLBACK_PER_STAFF
  return Math.floor(dayProfit * Math.min(1, elapsedSeconds / OFFLINE_FULL_SECONDS))
}

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

// Soma os efeitos (`fx`) de itens, coleções, equipe e evento do dia
const FX_ADD = ['comfort', 'patience', 'attraction', 'revenue', 'op']
const FX_MULT = ['prep', 'bake', 'register', 'ingredient', 'tip', 'wear', 'delivery']

function totalFx(s) {
  const t = {}
  for (const k of FX_ADD) t[k] = 0
  for (const k of FX_MULT) t[k] = 1
  const apply = (fx) => {
    if (!fx) return
    for (const k of FX_ADD) if (fx[k]) t[k] += fx[k]
    for (const k of FX_MULT) if (fx[k]) t[k] *= fx[k]
  }
  const o = s.owned || {}
  for (const item of SHOP_ITEMS) apply(itemFx(item, o[item.id]))
  for (const c of COLLECTIONS) if (collectionDone(c, o)) apply(c.fx)
  for (const m of s.staff || []) {
    const v = perkValue(m)
    if (v != null) apply({ [PERKS[m.role].key]: v })
  }
  apply(eventById(s.event)?.fx)
  return t
}

// Acima de 30 pontos, conforto extra rende menos (a satisfação não satura tão cedo)
const softComfort = (c) => (c > 30 ? 30 + (c - 30) * 0.4 : c)

export function getModifiers(s) {
  const o = s.owned || {}
  const fx = totalFx(s)
  const ovens = 1 + (o.oven2 ? 1 : 0) + (o.oven3 ? 1 : 0)
  const prepStations = 1 + (o.prep2 ? 1 : 0) + (o.prep3 ? 1 : 0)
  const cond = s.condition ?? 100
  const wear = cond < 25 ? 1.45 : cond < 50 ? 1.2 : 1
  return {
    ovens,
    ovenSlots: ovens * 2,
    prepStations,
    prepTime: 3.9 * Math.max(0.4, fx.prep) * wear,
    bakeTime: 7 * Math.max(0.45, 1 - 0.07 * ((s.ovenLevel || 1) - 1)) * fx.bake * wear,
    registerTime: Math.max(0.35, fx.register),
    ingredientMult: Math.max(0.4, fx.ingredient),
    tipMult: fx.tip,
    wearMult: fx.wear,
    deliveryInterval: fx.delivery,
    opCost: fx.op,
    walk: 1 + 0.06 * ((s.speedLevel || 1) - 1),
    comfort: softComfort(fx.comfort + (s.reformLevel || 0) * 5) + (cond < 25 ? -10 : 0),
    patience: 1 + fx.patience,
    attraction: Math.max(0.3, 1 + fx.attraction + (s.marketingLevel || 0) * 0.12 + (s.reputation || 0) / 100 * 0.6 + (s.level || 1) * 0.03),
    revenueMult: 1 + (s.franchises || 0) * 0.15 + fx.revenue,
    deliveryEnabled: (s.staff || []).some((m) => m.role === 'courier'),
  }
}

export const ingredientCost = (recipe, mods) => Math.round(recipe.price * INGREDIENT_RATIO * mods.ingredientMult)

export function operatingCost(s) {
  const m = getModifiers(s)
  return 20 + (s.tables || 2) * 3 + m.ovens * 8 + m.opCost + (s.expansions?.terrace ? 15 : 0)
}

export const maintenanceCost = (s) => Math.round((100 - (s.condition ?? 100)) * 4 * getModifiers(s).ovens)

export const unlockedRecipes = (s) => RECIPES.filter((r) => (s.recipes || []).includes(r.id))
