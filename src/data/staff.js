// Cargos, raridades e geração de candidatos
export const ROLES = {
  chef: { label: 'Pizzaiolo', plural: 'Pizzaiolos', baseSalary: 45, baseHire: 160, level: 2, desc: 'Monta as pizzas, opera o forno e finaliza os pedidos.' },
  waiter: { label: 'Garçom', plural: 'Garçons', baseSalary: 35, baseHire: 120, level: 2, desc: 'Leva as pizzas às mesas e limpa o salão.' },
  cashier: { label: 'Caixa', plural: 'Caixas', baseSalary: 38, baseHire: 130, level: 2, desc: 'Anota pedidos e processa pagamentos no balcão.' },
  courier: { label: 'Entregador', plural: 'Entregadores', baseSalary: 40, baseHire: 180, level: 3, desc: 'Leva pedidos de delivery de scooter. Habilita o delivery.' },
}
export const ROLE_KEYS = ['chef', 'waiter', 'cashier', 'courier']

// `tier` define a força do bônus especial (ver PERKS)
export const RARITIES = {
  comum: { label: 'Comum', color: '#7a8494', weight: 55, hireMult: 1, min: 0.8, max: 1.0, tier: 0 },
  bom: { label: 'Bom', color: '#2f9e5b', weight: 28, hireMult: 1.6, min: 0.95, max: 1.15, tier: 1 },
  otimo: { label: 'Ótimo', color: '#3a7fc4', weight: 13, hireMult: 2.5, min: 1.1, max: 1.3, tier: 2 },
  estrela: { label: 'Estrela', color: '#c98a12', weight: 4, hireMult: 4, min: 1.3, max: 1.5, tier: 3 },
}

// Bônus especial por cargo. Cada funcionário Bom ou melhor soma o seu valor ao jogo.
export const PERKS = {
  chef: { key: 'ingredient', values: [0.98, 0.96, 0.93], text: (v) => `Aproveita melhor os ingredientes: custo −${Math.round((1 - v) * 100)}%` },
  waiter: { key: 'comfort', values: [1, 2, 4], text: (v) => `Simpatia: satisfação +${v}` },
  cashier: { key: 'patience', values: [0.02, 0.04, 0.07], text: (v) => `Bom papo na fila: paciência +${Math.round(v * 100)}%` },
  courier: { key: 'delivery', values: [0.95, 0.9, 0.82], text: (v) => `Clientela fiel: delivery ${Math.round((1 / v - 1) * 100)}% mais frequente` },
}
export const rarityOf = (member) => RARITIES[member.rarity] || RARITIES.comum
// Valor do bônus do funcionário (null para Comum ou funcionários antigos)
export function perkValue(member) {
  const tier = rarityOf(member).tier
  return tier ? PERKS[member.role]?.values[tier - 1] ?? null : null
}
export function perkText(member) {
  const v = perkValue(member)
  return v == null ? null : PERKS[member.role].text(v)
}

const FIRST = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabi', 'Heitor', 'Iara', 'João', 'Karen', 'Lucas', 'Marina', 'Nina', 'Otávio', 'Paula', 'Rafa', 'Sofia', 'Tiago', 'Vera', 'Wesley', 'Yasmin', 'Caio', 'Bia', 'Davi', 'Luana', 'Enzo', 'Lívia', 'Pedro', 'Clara']
const LAST = ['Silva', 'Souza', 'Costa', 'Lima', 'Rocha', 'Alves', 'Ferreira', 'Gomes', 'Ribeiro', 'Martins', 'Araújo', 'Barbosa', 'Moreira', 'Nunes', 'Pereira']

export const randomName = (rnd = Math.random) => `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`

function rollRarity() {
  const entries = Object.entries(RARITIES)
  let roll = Math.random() * entries.reduce((a, [, r]) => a + r.weight, 0)
  for (const [key, r] of entries) { roll -= r.weight; if (roll <= 0) return key }
  return 'comum'
}

let seq = 0
export function makeCandidate(role, unitLevel = 1, rarity = rollRarity()) {
  const r = RARITIES[rarity]
  const stat = () => +(r.min + Math.random() * (r.max - r.min)).toFixed(2)
  const speed = stat()
  const eff = stat()
  const quality = (speed + eff) / 2
  const salary = Math.round(ROLES[role].baseSalary * (0.75 + quality * 0.45) + unitLevel * 2)
  return {
    id: `st-${Date.now().toString(36)}-${(seq++).toString(36)}`,
    name: randomName(),
    role,
    rarity,
    level: 1,
    speed,
    eff,
    salary,
    seed: Math.floor(Math.random() * 1e9),
  }
}

// Custo de contratação: cargo × raridade, +10% por funcionário já na equipe
export const hireCost = (candidate, staffCount) =>
  Math.round((ROLES[candidate.role].baseHire * rarityOf(candidate).hireMult * (1 + staffCount * 0.1)) / 10) * 10
// Rescisão ao demitir: dois dias de salário
export const severanceCost = (member) => member.salary * 2
// Trocar a lista antes do dia seguinte: fica mais caro a cada troca no mesmo dia
export const rerollCost = (unitLevel, rerollsToday) => (30 + unitLevel * 15) * (1 + rerollsToday)
// Treinamento: aumenta velocidade/eficiência e salário
export const trainCost = (member) => Math.round(90 * member.level * (1 + member.level * 0.35))
export const MAX_STAFF_LEVEL = 5
