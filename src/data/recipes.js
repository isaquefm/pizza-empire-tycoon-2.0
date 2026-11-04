// Receitas. O preço final de venda = price + ovenLevel × 3 (regra original:
// 18 + forno × 3 para a Margherita).
export const RECIPES = [
  { id: 'margherita', name: 'Margherita', price: 18, level: 1, unlockCost: 0, prep: 1.0, color: '#e8553d', toppings: ['#f4f1e6', '#4f9a45'], desc: 'Molho de tomate, muçarela e manjericão.' },
  { id: 'calabresa', name: 'Calabresa', price: 22, level: 2, unlockCost: 180, prep: 1.05, color: '#d9583a', toppings: ['#b8433b', '#f1e2c8'], desc: 'Calabresa fatiada e cebola roxa.' },
  { id: 'quatroqueijos', name: 'Quatro Queijos', price: 28, level: 3, unlockCost: 360, prep: 1.1, color: '#f2c25a', toppings: ['#fff1c2', '#f7d98b'], desc: 'Muçarela, provolone, parmesão e gorgonzola.' },
  { id: 'portuguesa', name: 'Portuguesa', price: 32, level: 4, unlockCost: 650, prep: 1.2, color: '#e66f3d', toppings: ['#f6f2e0', '#3f8f48', '#2c2c2c'], desc: 'Presunto, ovos, ervilha, azeitona e cebola.' },
  { id: 'pepperoni', name: 'Pepperoni Especial', price: 40, level: 5, unlockCost: 1100, prep: 1.25, color: '#d5462f', toppings: ['#a8302b', '#f3d27a'], desc: 'Pepperoni crocante com borda recheada.' },
  { id: 'trufada', name: 'Trufada Gourmet', price: 55, level: 7, unlockCost: 2600, prep: 1.35, color: '#f0d9a0', toppings: ['#5b4636', '#e9e3d0'], desc: 'Creme de trufas, cogumelos e parmesão.' },
]

export const recipeById = (id) => RECIPES.find((r) => r.id === id) || RECIPES[0]

// Custo de ingredientes por pizza (fração do preço base)
export const INGREDIENT_RATIO = 0.25
