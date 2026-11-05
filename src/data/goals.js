// Metas com recompensa. Depois de cumpridas ficam registradas em `goalsDone`
// e não voltam a ficar pendentes (nem depois de abrir uma franquia).
import { RARITIES, rarityOf } from './staff'
import { COLLECTIONS, collectionDone, SHOP_ITEMS, nextStep } from './shopItems'

const avgSat = (s) => s.satHistory.reduce((a, b) => a + b, 0) / Math.max(1, s.satHistory.length)

export const GOALS = [
  { id: 'first', text: 'Entregue o primeiro pedido', reward: 30, done: (s) => s.totals.pizzas >= 1 },
  { id: 'lvl2', text: 'Alcance o nível 2 e contrate o primeiro funcionário', reward: 100, done: (s) => s.level >= 2 && s.staff.length > 0 },
  { id: 'decor', text: 'Compre 3 itens na loja', reward: 120, done: (s) => Object.keys(s.owned).length >= 3 },
  { id: 'tables', text: 'Tenha 6 mesas no salão', reward: 200, done: (s) => s.tables >= 6 },
  { id: 'recipe', text: 'Libere uma nova receita', reward: 120, done: (s) => s.recipes.length >= 2 },
  { id: 'tier', text: 'Evolua um equipamento para o nível 2', reward: 200, done: (s) => Object.values(s.owned).some((v) => v >= 2) },
  { id: 'rare', text: `Contrate um funcionário ${RARITIES.otimo.label} ou ${RARITIES.estrela.label}`, reward: 250, done: (s) => s.staff.some((m) => rarityOf(m).tier >= 2) },
  { id: 'oven2', text: 'Instale o segundo forno', reward: 300, done: (s) => !!s.owned.oven2 },
  { id: 'delivery', text: 'Contrate um entregador e faça 5 entregas', reward: 300, done: (s) => s.totals.deliveries >= 5 },
  { id: 'sat', text: 'Mantenha a satisfação acima de 85%', reward: 400, done: (s) => s.satHistory.length >= 10 && avgSat(s) >= 85 },
  { id: 'collection', text: 'Complete uma coleção da loja', reward: 800, done: (s) => COLLECTIONS.some((c) => collectionDone(c, s.owned)) },
  { id: 'terrace', text: 'Construa a varanda externa', reward: 500, done: (s) => !!s.expansions.terrace },
  { id: 'days', text: 'Sobreviva a 15 dias de operação', reward: 600, done: (s) => s.day > 15 },
  { id: 'rich', text: 'Fature R$ 10.000 no total', reward: 500, done: (s) => s.lifetime >= 10000 },
  { id: 'franchise', text: 'Abra a segunda unidade (franquia)', reward: 1500, done: (s) => s.franchises >= 1 },
  { id: 'catalog', text: 'Instale e evolua todos os itens da loja', reward: 5000, done: (s) => SHOP_ITEMS.every((i) => s.owned[i.id] && !nextStep(i, s.owned[i.id])) },
  { id: 'rich2', text: 'Fature R$ 100.000 no total', reward: 5000, done: (s) => s.lifetime >= 100000 },
]
