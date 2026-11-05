// Eventos sorteados no início de cada dia (a partir do dia 2).
// `fx` usa as mesmas chaves dos itens da loja.
export const EVENTS = [
  { id: 'festival', name: 'Festa no bairro', tone: 'good', weight: 3, desc: 'A rua está cheia hoje. Movimento +35%.', fx: { attraction: 0.35 } },
  { id: 'match', name: 'Jogo decisivo na TV', tone: 'good', weight: 3, desc: 'Todo mundo quer pizza. Movimento +25% e delivery mais frequente.', fx: { attraction: 0.25, delivery: 0.75 } },
  { id: 'influencer', name: 'Influenciador na cidade', tone: 'good', weight: 2, desc: 'Um vídeo sobre a casa viralizou. Movimento +15% e gorjetas +30%.', fx: { attraction: 0.15, tip: 1.3 } },
  { id: 'rain', name: 'Dia de chuva', tone: 'mixed', weight: 3, desc: 'Menos gente na rua (movimento −20%), mas o delivery dispara.', fx: { attraction: -0.2, delivery: 0.6 } },
  { id: 'critic', name: 'Crítico gastronômico', tone: 'mixed', weight: 2, desc: 'Termine o dia com satisfação de 75% ou mais: reputação +6. Abaixo disso: reputação −4.', critic: true },
  { id: 'shortage', name: 'Falta de ingredientes', tone: 'bad', weight: 2, desc: 'O fornecedor atrasou. Ingredientes 30% mais caros hoje.', fx: { ingredient: 1.3 } },
  { id: 'blackout', name: 'Oscilação de energia', tone: 'bad', weight: 2, desc: 'Os fornos perdem força. Pizzas assam 20% mais devagar hoje.', fx: { bake: 1.2 } },
]

export const eventById = (id) => EVENTS.find((e) => e.id === id) || null

const EVENT_CHANCE = 0.55

// Retorna o id do evento do dia ou null. Evita repetir o evento anterior.
export function rollEvent(previousId) {
  if (Math.random() > EVENT_CHANCE) return null
  const pool = EVENTS.filter((e) => e.id !== previousId)
  let roll = Math.random() * pool.reduce((a, e) => a + e.weight, 0)
  for (const e of pool) { roll -= e.weight; if (roll <= 0) return e.id }
  return null
}
