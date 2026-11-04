import { create } from 'zustand'
import {
  ovenUpgradeCost, speedUpgradeCost, expandCost, franchiseCost, levelForServed, OFFLINE_RATE,
  marketingCost, reformCost, MAX_REFORM, MAX_MARKETING, EXPANSIONS, maxTables, maxStaff,
  operatingCost, maintenanceCost,
} from './Economy/economy'
import { SHOP_ITEMS } from '../data/shopItems'
import { RECIPES } from '../data/recipes'
import { ROLES, makeCandidate, hireCost, trainCost, MAX_STAFF_LEVEL } from '../data/staff'

const SAVE_KEY = 'pizza-empire-save-v2'
const LEGACY_KEY = 'pizza-empire-save-v1'
export const OPEN_HOUR = 8
export const CLOSE_HOUR = 22

const emptyDay = () => ({ revenue: 0, tips: 0, ingredients: 0, salaries: 0, operating: 0, purchases: 0, maintenance: 0, served: 0, lost: 0, deliveries: 0 })

const OWNER = { id: 'owner', name: 'Você', role: 'owner', level: 1, speed: 1, eff: 1, salary: 0, seed: 7 }

const initial = () => ({
  // ---- v1 (preservado)
  money: 200, lifetime: 0, level: 1, served: 0, reputation: 0, // capital inicial de R$ 200 para novas unidades
  ovenLevel: 1, speedLevel: 1, tables: 2,
  unlocked: { kitchen: true, dining: true, staff: false, secondOven: false, franchise: false },
  lastSeen: Date.now(), tutorialDone: false,
  // ---- v2
  staff: [], owned: {}, recipes: ['margherita'], expansions: {},
  marketingLevel: 0, reformLevel: 0, condition: 100, franchises: 0,
  theme: { wall: 'creme', floor: 'carvalho', cloth: 'vermelho' },
  day: 1, clock: OPEN_HOUR * 60,
  today: emptyDay(), history: [],
  satHistory: [], totals: { customers: 0, lost: 0, deliveries: 0, pizzas: 0 },
  candidates: [],
  settings: { quality: 'alta', labels: true },
})

const PERSIST = Object.keys(initial())

function unlocks(level, prev) {
  return { ...prev, staff: level >= 2, secondOven: level >= 3, franchise: level >= 5 }
}

function migrateLegacy(old) {
  // v1 guardava "staff" como número de auxiliares
  const n = typeof old.staff === 'number' ? old.staff : 0
  const staff = Array.from({ length: n }, (_, i) => makeCandidate(i % 2 ? 'waiter' : 'chef', old.level || 1))
  return { ...initial(), ...old, staff, owned: {}, recipes: ['margherita'] }
}

function loadSave() {
  try {
    let saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')
    if (!saved) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null')
      if (legacy) saved = migrateLegacy(legacy)
    }
    if (!saved) return { ...initial(), offlineEarned: 0 }
    const base = initial()
    const merged = { ...base, ...saved, today: { ...emptyDay(), ...(saved.today || {}) }, totals: { ...base.totals, ...(saved.totals || {}) }, settings: { ...base.settings, ...(saved.settings || {}) }, theme: { ...base.theme, ...(saved.theme || {}) } }
    if (!Array.isArray(merged.staff)) merged.staff = []
    // Renda offline (regra original): 0,45/s por funcionário, limite de 4 h
    const elapsed = Math.max(0, Math.min(4 * 3600, (Date.now() - (saved.lastSeen || Date.now())) / 1000))
    const offline = Math.floor(elapsed * merged.staff.length * OFFLINE_RATE)
    return { ...merged, money: merged.money + offline, lifetime: merged.lifetime + offline, lastSeen: Date.now(), offlineEarned: offline }
  } catch {
    return { ...initial(), offlineEarned: 0 }
  }
}

let noticeSeq = 0

export const useGame = create((set, get) => ({
  ...loadSave(),
  // ---- estado de sessão (não salvo)
  speed: 1, paused: false, tab: 'Loja',
  live: { inside: 0, queue: 0, waitingFood: 0, preparing: 0, baking: 0, ready: 0, seats: 0, seatsFree: 0, customers: [], workers: {}, deliveriesOut: 0 },
  entities: [],
  selected: null,
  notices: [],
  log: [],
  modal: null,
  cameraCmd: null,

  // ---------- utilidades
  notify: (text, type = 'info') => {
    const id = ++noticeSeq
    set((s) => ({ notices: [...s.notices.slice(-3), { id, text, type }], log: [{ id, text, type, day: s.day, clock: s.clock }, ...s.log].slice(0, 40) }))
    setTimeout(() => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })), 4200)
  },
  setModal: (modal) => set({ modal }),
  select: (selected) => set({ selected }),
  setSpeed: (speed) => set({ speed, paused: false }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  camera: (cmd) => set({ cameraCmd: { cmd, t: Date.now() } }),
  setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

  // Gasto genérico — sempre verifica o saldo
  spend: (amount, bucket = 'purchases') => {
    if (amount < 0 || get().money < amount) return false
    set((s) => ({ money: s.money - amount, today: { ...s.today, [bucket]: s.today[bucket] + amount } }))
    return true
  },
  addMoney: (amount) => set((s) => ({ money: s.money + amount, lifetime: s.lifetime + amount, today: { ...s.today, revenue: s.today.revenue + amount } })),

  // ---------- eventos da simulação
  chargeIngredients: (cost) => set((s) => ({ money: s.money - cost, today: { ...s.today, ingredients: s.today.ingredients + cost } })),
  wearEquipment: (amount) => set((s) => ({ condition: Math.max(0, s.condition - amount) })),

  // Venda concluída (equivalente ao serve() original)
  completeSale: ({ amount, tip = 0, satisfaction = 70, delivery = false }) => set((s) => {
    const served = s.served + 1
    const level = Math.max(s.level, levelForServed(served))
    const repDelta = satisfaction >= 75 ? 1 : satisfaction < 45 ? -1 : 0
    const total = amount + tip
    const out = {
      served, level, unlocked: unlocks(level, s.unlocked),
      reputation: Math.max(0, Math.min(100, s.reputation + repDelta)),
      money: s.money + total, lifetime: s.lifetime + total,
      today: { ...s.today, revenue: s.today.revenue + amount, tips: s.today.tips + tip, served: s.today.served + 1, deliveries: s.today.deliveries + (delivery ? 1 : 0) },
      totals: { ...s.totals, customers: s.totals.customers + (delivery ? 0 : 1), deliveries: s.totals.deliveries + (delivery ? 1 : 0), pizzas: s.totals.pizzas + 1 },
      satHistory: delivery ? s.satHistory : [...s.satHistory, satisfaction].slice(-24),
    }
    if (level > s.level) setTimeout(() => get().notify(`Nível ${level} alcançado! Novos itens podem ter sido liberados.`, 'level'), 0)
    return out
  }),
  customerLost: () => set((s) => ({
    reputation: Math.max(0, s.reputation - 2),
    today: { ...s.today, lost: s.today.lost + 1 },
    totals: { ...s.totals, lost: s.totals.lost + 1 },
    satHistory: [...s.satHistory, 8].slice(-24),
  })),

  advanceClock: (minutes) => set((s) => ({ clock: s.clock + minutes })),

  // Fechamento do dia: salários e custos operacionais
  endDay: () => {
    const s = get()
    const salaries = s.staff.reduce((a, m) => a + m.salary, 0)
    const operating = operatingCost(s)
    const t = { ...s.today, salaries: s.today.salaries + salaries, operating: s.today.operating + operating }
    const income = t.revenue + t.tips
    const costs = t.ingredients + t.salaries + t.operating + t.maintenance
    const record = { day: s.day, ...t, profit: income - costs }
    set({
      money: s.money - salaries - operating,
      history: [...s.history, record].slice(-30),
      today: emptyDay(), day: s.day + 1, clock: OPEN_HOUR * 60,
      condition: Math.max(0, s.condition - 4),
      candidates: [],
    })
    get().notify(`Dia ${s.day} encerrado · Lucro operacional R$ ${Math.round(record.profit).toLocaleString('pt-BR')} · Salários R$ ${salaries} · Custos R$ ${operating}`, record.profit >= 0 ? 'success' : 'warn')
    get().save()
  },

  // ---------- melhorias (regras originais)
  upgradeOven: () => {
    const s = get(), cost = ovenUpgradeCost(s.ovenLevel)
    if (s.ovenLevel >= 10) return false
    if (!get().spend(cost)) return false
    set((v) => ({ ovenLevel: v.ovenLevel + 1 }))
    return true
  },
  upgradeSpeed: () => {
    const s = get(), cost = speedUpgradeCost(s.speedLevel)
    if (s.speedLevel >= 10) return false
    if (!get().spend(cost)) return false
    set((v) => ({ speedLevel: v.speedLevel + 1 }))
    return true
  },
  expand: () => {
    const s = get(), cost = expandCost(s.tables)
    if (s.tables + 2 > maxTables(s)) return false
    if (!get().spend(cost)) return false
    set((v) => ({ tables: v.tables + 2, unlocked: { ...v.unlocked, dining: true } }))
    return true
  },
  upgradeMarketing: () => {
    const s = get()
    if (s.marketingLevel >= MAX_MARKETING || !get().spend(marketingCost(s.marketingLevel))) return false
    set((v) => ({ marketingLevel: v.marketingLevel + 1 }))
    return true
  },
  reform: () => {
    const s = get()
    if (s.reformLevel >= MAX_REFORM || !get().spend(reformCost(s.reformLevel))) return false
    set((v) => ({ reformLevel: v.reformLevel + 1 }))
    return true
  },
  maintain: () => {
    const s = get(), cost = maintenanceCost(s)
    if (cost <= 0) return 'ok'
    if (!get().spend(cost, 'maintenance')) return false
    set({ condition: 100 })
    return true
  },
  unlockRecipe: (id) => {
    const s = get(), r = RECIPES.find((x) => x.id === id)
    if (!r || s.recipes.includes(id) || s.level < r.level) return false
    if (!get().spend(r.unlockCost)) return false
    set((v) => ({ recipes: [...v.recipes, id] }))
    return true
  },
  buildExpansion: (id) => {
    const s = get(), e = EXPANSIONS.find((x) => x.id === id)
    if (!e || s.expansions[id] || s.level < e.level) return false
    if (!get().spend(e.price)) return false
    set((v) => ({ expansions: { ...v.expansions, [id]: true } }))
    return true
  },
  canBuy: (item) => {
    const s = get()
    if (s.owned[item.id]) return { ok: false, reason: 'Adquirido' }
    if (s.level < item.level) return { ok: false, reason: `Nível ${item.level}` }
    if (item.id === 'oven2' && !s.unlocked.secondOven) return { ok: false, reason: 'Nível 3' }
    if (item.requires && !s.expansions[item.requires]) return { ok: false, reason: 'Requer ampliação' }
    if (s.money < item.price) return { ok: false, reason: 'Saldo insuficiente' }
    return { ok: true }
  },
  buyItem: (id) => {
    const item = SHOP_ITEMS.find((i) => i.id === id)
    if (!item) return false
    const check = get().canBuy(item)
    if (!check.ok) return false
    if (!get().spend(item.price)) return false
    set((s) => ({ owned: { ...s.owned, [id]: true }, reputation: id === 'sign' ? Math.min(100, s.reputation + 3) : s.reputation }))
    return true
  },
  setTheme: (key, value, cost) => {
    if (get().theme[key] === value) return true
    if (!get().spend(cost)) return false
    set((s) => ({ theme: { ...s.theme, [key]: value } }))
    return true
  },

  // ---------- equipe
  refreshCandidates: () => {
    const s = get()
    const roles = Object.keys(ROLES).filter((r) => s.level >= ROLES[r].level)
    const candidates = roles.flatMap((r) => [makeCandidate(r, s.level), makeCandidate(r, s.level)])
    set({ candidates })
  },
  hire: (candidateId) => {
    const s = get()
    const c = s.candidates.find((x) => x.id === candidateId)
    if (!c || !s.unlocked.staff || s.level < ROLES[c.role].level) return false
    if (s.staff.length >= maxStaff(s)) return false
    if (!get().spend(hireCost(s.staff.length))) return false
    set((v) => ({ staff: [...v.staff, { ...c, hiredDay: v.day }], candidates: v.candidates.filter((x) => x.id !== candidateId) }))
    return true
  },
  fire: (id) => set((s) => ({ staff: s.staff.filter((m) => m.id !== id) })),
  train: (id) => {
    const s = get(), m = s.staff.find((x) => x.id === id)
    if (!m || m.level >= MAX_STAFF_LEVEL) return false
    if (!get().spend(trainCost(m))) return false
    set((v) => ({ staff: v.staff.map((x) => x.id === id ? { ...x, level: x.level + 1, speed: +(x.speed * 1.08).toFixed(2), eff: +(x.eff * 1.1).toFixed(2), salary: Math.round(x.salary * 1.15) } : x) }))
    return true
  },

  // Melhorar tudo: compra as próximas melhorias mais baratas enquanto houver saldo
  upgradeAll: () => {
    let bought = 0, spent = 0
    for (let guard = 0; guard < 40; guard++) {
      const s = get()
      const options = [
        s.ovenLevel < 10 && { cost: ovenUpgradeCost(s.ovenLevel), run: get().upgradeOven },
        s.speedLevel < 10 && { cost: speedUpgradeCost(s.speedLevel), run: get().upgradeSpeed },
        s.marketingLevel < MAX_MARKETING && { cost: marketingCost(s.marketingLevel), run: get().upgradeMarketing },
        ...s.staff.filter((m) => m.level < MAX_STAFF_LEVEL).map((m) => ({ cost: trainCost(m), run: () => get().train(m.id) })),
      ].filter(Boolean).sort((a, b) => a.cost - b.cost)
      const next = options[0]
      if (!next || next.cost > s.money) break
      if (!next.run()) break
      bought++; spent += next.cost
    }
    return { bought, spent }
  },

  // Franquia (regra original: nível 5, reinicia a unidade e sobe um nível)
  buyFranchise: () => {
    const s = get()
    if (!s.unlocked.franchise || !get().spend(franchiseCost(s.franchises))) return false
    set((v) => ({
      level: v.level + 1, served: 0, reputation: 0, staff: [], tables: 2, ovenLevel: 1, speedLevel: 1,
      owned: {}, expansions: {}, reformLevel: 0, marketingLevel: 0, condition: 100, franchises: v.franchises + 1,
      unlocked: { ...v.unlocked, franchise: false }, satHistory: [], candidates: [],
    }))
    return true
  },

  markTutorial: () => set({ tutorialDone: true }),
  save: () => {
    const s = get()
    const data = {}
    for (const k of PERSIST) data[k] = s[k]
    data.lastSeen = Date.now()
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)) } catch { /* armazenamento indisponível */ }
  },
  reset: () => {
    try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(LEGACY_KEY) } catch { /* ignore */ }
    set({ ...initial(), lastSeen: Date.now(), selected: null, log: [], offlineEarned: 0 })
  },
}))

export const OWNER_MEMBER = OWNER

// Satisfação média dos últimos clientes (começa em 72%)
export const satisfactionOf = (s) => {
  const h = s.satHistory
  if (!h.length) return 72
  return Math.round(h.reduce((a, b) => a + b, 0) / h.length)
}
export const starsOf = (s) => Math.max(1, Math.min(5, Math.round(1 + s.reputation / 25)))
