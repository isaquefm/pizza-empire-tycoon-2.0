// Cargos e geração de candidatos
export const ROLES = {
  chef: { label: 'Pizzaiolo', plural: 'Pizzaiolos', baseSalary: 45, level: 2, desc: 'Monta as pizzas, opera o forno e finaliza os pedidos.' },
  waiter: { label: 'Garçom', plural: 'Garçons', baseSalary: 35, level: 2, desc: 'Leva as pizzas às mesas e limpa o salão.' },
  cashier: { label: 'Caixa', plural: 'Caixas', baseSalary: 38, level: 2, desc: 'Anota pedidos e processa pagamentos no balcão.' },
  courier: { label: 'Entregador', plural: 'Entregadores', baseSalary: 40, level: 3, desc: 'Leva pedidos de delivery de scooter. Habilita o delivery.' },
}
export const ROLE_KEYS = ['chef', 'waiter', 'cashier', 'courier']

const FIRST = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabi', 'Heitor', 'Iara', 'João', 'Karen', 'Lucas', 'Marina', 'Nina', 'Otávio', 'Paula', 'Rafa', 'Sofia', 'Tiago', 'Vera', 'Wesley', 'Yasmin', 'Caio', 'Bia', 'Davi', 'Luana', 'Enzo', 'Lívia', 'Pedro', 'Clara']
const LAST = ['Silva', 'Souza', 'Costa', 'Lima', 'Rocha', 'Alves', 'Ferreira', 'Gomes', 'Ribeiro', 'Martins', 'Araújo', 'Barbosa', 'Moreira', 'Nunes', 'Pereira']

export const randomName = (rnd = Math.random) => `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`

let seq = 0
export function makeCandidate(role, unitLevel = 1) {
  const speed = +(0.85 + Math.random() * 0.4).toFixed(2)
  const eff = +(0.8 + Math.random() * 0.45).toFixed(2)
  const quality = (speed + eff) / 2
  const salary = Math.round(ROLES[role].baseSalary * (0.75 + quality * 0.45) + unitLevel * 2)
  return {
    id: `st-${Date.now().toString(36)}-${(seq++).toString(36)}`,
    name: randomName(),
    role,
    level: 1,
    speed,
    eff,
    salary,
    seed: Math.floor(Math.random() * 1e9),
  }
}

// Custo de contratação (regra original: 120 + 100 × tamanho da equipe)
export const hireCost = (staffCount) => 120 + staffCount * 100
// Treinamento: aumenta velocidade/eficiência e salário
export const trainCost = (member) => Math.round(90 * member.level * (1 + member.level * 0.35))
export const MAX_STAFF_LEVEL = 5
