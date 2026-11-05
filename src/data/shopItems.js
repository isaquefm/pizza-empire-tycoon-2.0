// Catálogo da loja. Cada item declara seus efeitos em `fx` (aplicados em
// systems/Economy/economy.js) e aparece no cenário 3D quando adquirido.
// `level` = nível mínimo da unidade; `requires` = expansão necessária;
// `spot` = [x, z] para onde a câmera vai ao instalar;
// `upgrades` = níveis seguintes do equipamento (o `fx` de cada nível é o total, não a soma).
//
// Chaves de fx: comfort, patience, attraction, revenue, op (somam);
// prep, bake, register, ingredient, tip, wear, delivery (multiplicam).
export const SHOP_CATEGORIES = ['Tudo', 'Cozinha', 'Máquinas', 'Salão', 'Conforto', 'Decoração']

export const SHOP_ITEMS = [
  // ---- Cozinha
  { id: 'prep2', name: 'Bancada de preparo', category: 'Cozinha', price: 250, level: 1, icon: 'Utensils', tag: 'MAIS VENDIDO', spot: [-2, -4.5],
    desc: 'Mais uma estação de montagem para preparar pizzas em paralelo.', benefit: '+1 estação de preparo', capacity: 'Capacidade: 2 pizzas simultâneas' },
  { id: 'fridge', name: 'Geladeira industrial', category: 'Cozinha', price: 400, level: 1, icon: 'Refrigerator', spot: [-6, -4.5], fx: { ingredient: 0.8 },
    desc: 'Ingredientes frescos e bem armazenados reduzem o desperdício.', benefit: 'Ingredientes −20% no custo', capacity: 'Estoque +20%',
    upgrades: [
      { price: 1100, level: 4, benefit: 'Ingredientes −28% no custo', fx: { ingredient: 0.72 } },
      { price: 2600, level: 7, benefit: 'Ingredientes −35% no custo', fx: { ingredient: 0.65 } },
    ] },
  { id: 'shelves', name: 'Prateleiras de ingredientes', category: 'Cozinha', price: 300, level: 2, icon: 'Package', spot: [-4.85, -4.5], fx: { prep: 0.85 },
    desc: 'Tudo à mão: molhos, queijos e coberturas organizados.', benefit: 'Preparo 15% mais rápido', capacity: '24 potes de ingredientes',
    upgrades: [{ price: 800, level: 4, benefit: 'Preparo 20% mais rápido', fx: { prep: 0.8 } }] },
  { id: 'freezer', name: 'Freezer de reserva', category: 'Cozinha', price: 1500, level: 3, icon: 'Snowflake', spot: [7, -3.7], fx: { ingredient: 0.9 },
    desc: 'Compre no atacado e guarde: menos viagens e menos perda.', benefit: 'Ingredientes −10% no custo', capacity: '400 L' },
  { id: 'ferment', name: 'Armário de fermentação', category: 'Cozinha', price: 900, level: 3, icon: 'Wheat', spot: [-7, -3.4], fx: { prep: 0.9 },
    desc: 'Massa descansada na temperatura certa, sempre pronta para abrir.', benefit: 'Preparo 10% mais rápido', capacity: '40 bolinhas de massa' },
  { id: 'hood', name: 'Coifa de inox', category: 'Cozinha', price: 1100, level: 3, icon: 'Wind', spot: [-2, -4.8], fx: { wear: 0.7 },
    desc: 'Menos gordura e fumaça: os equipamentos duram bem mais.', benefit: 'Desgaste dos equipamentos −30%', capacity: '3 m de exaustão' },
  { id: 'prep3', name: 'Bancada dupla de montagem', category: 'Cozinha', price: 900, level: 4, icon: 'ChefHat', requires: 'kitchen', spot: [-0.4, -4.5],
    desc: 'Terceira estação de preparo para cozinhas movimentadas.', benefit: '+1 estação de preparo', capacity: 'Capacidade: 3 pizzas simultâneas' },
  // ---- Máquinas
  { id: 'register', name: 'Caixa registradora moderna', category: 'Máquinas', price: 350, level: 1, icon: 'Calculator', spot: [-1.6, -2.3], fx: { register: 0.7 },
    desc: 'Terminal com cartão e PIX: pedidos e pagamentos muito mais ágeis.', benefit: 'Atendimento no caixa 30% mais rápido', capacity: '1 terminal',
    upgrades: [{ price: 900, level: 4, benefit: 'Atendimento no caixa 40% mais rápido', fx: { register: 0.6 } }] },
  { id: 'tablet', name: 'Comandas digitais', category: 'Máquinas', price: 550, level: 2, icon: 'Tablet', spot: [-0.6, -2.3], fx: { register: 0.85 },
    desc: 'Pedido direto na tela, sem papel e sem erro de anotação.', benefit: 'Atendimento no caixa 15% mais rápido', capacity: '1 tablet' },
  { id: 'mixer', name: 'Masseira automática', category: 'Máquinas', price: 650, level: 3, icon: 'Cog', spot: [-2, -4.5], fx: { prep: 0.8 },
    desc: 'Massa sempre no ponto, sem esforço manual.', benefit: 'Preparo 20% mais rápido', capacity: '10 kg de massa por ciclo',
    upgrades: [{ price: 1800, level: 6, benefit: 'Preparo 28% mais rápido', fx: { prep: 0.72 } }] },
  { id: 'oven2', name: 'Segundo forno a lenha', category: 'Máquinas', price: 1200, level: 3, icon: 'Flame', tag: 'RECOMENDADO', spot: [2.9, -4.5],
    desc: 'Dobre a capacidade de assar pizzas ao mesmo tempo.', benefit: '+2 pizzas no forno', capacity: 'Total: 4 pizzas assando' },
  { id: 'stone', name: 'Pedras refratárias', category: 'Máquinas', price: 1400, level: 4, icon: 'Layers', spot: [6.1, -4.6], fx: { bake: 0.88 },
    desc: 'Calor por igual e massa crocante em menos tempo.', benefit: 'Pizzas assam 12% mais rápido', capacity: 'Para todos os fornos' },
  { id: 'totem', name: 'Totem de autoatendimento', category: 'Máquinas', price: 1800, level: 5, icon: 'MonitorSmartphone', spot: [7, -1], fx: { register: 0.8, attraction: 0.03 },
    desc: 'Clientes consultam o cardápio e adiantam o pedido na tela.', benefit: 'Caixa 20% mais rápido · movimento +3%', capacity: '1 totem' },
  { id: 'oven3', name: 'Terceiro forno a lenha', category: 'Máquinas', price: 3200, level: 6, icon: 'Flame', requires: 'kitchen', spot: [4.4, -4.5],
    desc: 'Para uma cozinha de alto volume.', benefit: '+2 pizzas no forno', capacity: 'Total: 6 pizzas assando' },
  // ---- Salão
  { id: 'heatlamp', name: 'Lâmpadas de aquecimento', category: 'Salão', price: 280, level: 1, icon: 'Lamp', spot: [2.2, -2.3], fx: { comfort: 4 },
    desc: 'As pizzas aguardam quentinhas na área de retirada.', benefit: 'Satisfação +4', capacity: '4 pizzas aquecidas',
    upgrades: [{ price: 650, level: 4, benefit: 'Satisfação +7', fx: { comfort: 7 } }] },
  { id: 'booths', name: 'Cadeiras estofadas', category: 'Salão', price: 700, level: 2, icon: 'Armchair', spot: [-1.6, 2.4], fx: { comfort: 8, patience: 0.1 },
    desc: 'Troca as cadeiras de madeira por assentos acolchoados.', benefit: 'Conforto +8 · paciência +10%', capacity: 'Todas as mesas',
    upgrades: [{ price: 1600, level: 5, benefit: 'Conforto +12 · paciência +15%', fx: { comfort: 12, patience: 0.15 } }] },
  { id: 'tv', name: 'TV no salão', category: 'Salão', price: 1300, level: 4, icon: 'Tv', spot: [6.5, 2.4], fx: { attraction: 0.1, patience: 0.1, op: 5 },
    desc: 'Futebol e novela: a espera passa rápido e a casa enche.', benefit: 'Movimento +10% · paciência +10%', capacity: '55 polegadas · +R$ 5/dia de energia' },
  { id: 'dessert', name: 'Vitrine de sobremesas', category: 'Salão', price: 2200, level: 5, icon: 'CakeSlice', spot: [0.1, -2.3], fx: { tip: 1.25, revenue: 0.05 },
    desc: 'Tortas e pizzas doces no balcão convidam a pedir mais.', benefit: 'Gorjetas +25% · faturamento +5%', capacity: '12 porções' },
  { id: 'wine', name: 'Adega de vinhos', category: 'Salão', price: 3600, level: 6, icon: 'Wine', spot: [-6.8, 5.2], fx: { tip: 1.1, revenue: 0.08 },
    desc: 'Uma boa harmonização faz a conta (e a gorjeta) crescer.', benefit: 'Faturamento +8% · gorjetas +10%', capacity: '30 rótulos' },
  // ---- Conforto
  { id: 'drink', name: 'Bebedouro', category: 'Conforto', price: 150, level: 1, icon: 'GlassWater', spot: [-7, -0.25], fx: { comfort: 5 },
    desc: 'Água geladinha para clientes e equipe durante o expediente.', benefit: 'Satisfação +5', capacity: '20 L',
    upgrades: [{ price: 400, level: 3, benefit: 'Satisfação +7', fx: { comfort: 7 } }] },
  { id: 'wifi', name: 'Wi-Fi grátis', category: 'Conforto', price: 380, level: 2, icon: 'Wifi', spot: [6.5, 0.8], fx: { patience: 0.12, op: 3 },
    desc: 'Com internet boa, ninguém olha o relógio.', benefit: 'Paciência +12%', capacity: 'Todo o salão · +R$ 3/dia' },
  { id: 'fans', name: 'Ventiladores de teto', category: 'Conforto', price: 600, level: 2, icon: 'Fan', spot: [-1.5, 2.4], fx: { comfort: 3, patience: 0.05 },
    desc: 'Uma brisa constante no salão.', benefit: 'Satisfação +3 · paciência +5%', capacity: '2 ventiladores' },
  { id: 'music', name: 'Sistema de som ambiente', category: 'Conforto', price: 450, level: 2, icon: 'Music', spot: [-6, 2.4], fx: { comfort: 4, patience: 0.1 },
    desc: 'Uma trilha suave deixa a espera mais agradável.', benefit: 'Satisfação +4 · paciência +10%', capacity: '4 caixas de som',
    upgrades: [
      { price: 1100, level: 4, benefit: 'Satisfação +6 · paciência +15%', fx: { comfort: 6, patience: 0.15 } },
      { price: 2400, level: 7, benefit: 'Satisfação +8 · paciência +20%', fx: { comfort: 8, patience: 0.2 } },
    ] },
  { id: 'ac', name: 'Ar-condicionado', category: 'Conforto', price: 800, level: 3, icon: 'Snowflake', spot: [-6, 2.4], fx: { patience: 0.25, op: 10 },
    desc: 'Clima agradável o dia todo no salão.', benefit: 'Paciência +25%', capacity: '24.000 BTU · +R$ 10/dia',
    upgrades: [{ price: 1900, level: 6, benefit: 'Paciência +35% · energia R$ 8/dia', fx: { patience: 0.35, op: 8 } }] },
  { id: 'jukebox', name: 'Jukebox retrô', category: 'Conforto', price: 950, level: 3, icon: 'Disc3', spot: [6.5, 1.4], fx: { comfort: 3, attraction: 0.05 },
    desc: 'Cada mesa escolhe a próxima música. Um charme na casa.', benefit: 'Satisfação +3 · movimento +5%', capacity: '100 faixas' },
  // ---- Decoração
  { id: 'chalkboard', name: 'Lousa de sabores', category: 'Decoração', price: 200, level: 1, icon: 'PenLine', spot: [-6.5, -0.9], fx: { attraction: 0.04 },
    desc: 'O sabor do dia escrito à mão desperta a curiosidade.', benefit: 'Movimento +4%', capacity: '1 lousa' },
  { id: 'bunting', name: 'Bandeirinhas da casa', category: 'Decoração', price: 240, level: 1, icon: 'Flag', spot: [0, 2.4], fx: { comfort: 2, attraction: 0.03 },
    desc: 'Varais coloridos dão clima de festa ao salão.', benefit: 'Satisfação +2 · movimento +3%', capacity: '2 varais' },
  { id: 'sign', name: 'Fachada iluminada', category: 'Decoração', price: 320, level: 1, icon: 'Sparkles', spot: [0, 6], fx: { attraction: 0.12 },
    desc: 'Letreiro neon e lâmpadas que deixam a pizzaria inconfundível.', benefit: 'Reputação +3 · movimento +12%', capacity: 'Fachada completa',
    upgrades: [{ price: 1400, level: 5, benefit: 'Movimento +20%', fx: { attraction: 0.2 } }] },
  { id: 'plants', name: 'Plantas decorativas', category: 'Decoração', price: 180, level: 1, icon: 'Sprout', spot: [-1.5, 2.4], fx: { comfort: 3 },
    desc: 'Vasos e folhagens deixam o ambiente vivo e acolhedor.', benefit: 'Satisfação +3', capacity: '6 vasos',
    upgrades: [{ price: 480, level: 3, benefit: 'Satisfação +5', fx: { comfort: 5 } }] },
  { id: 'paintings', name: 'Quadros e murais', category: 'Decoração', price: 260, level: 2, icon: 'Frame', spot: [-6, 2.4], fx: { comfort: 3, attraction: 0.05 },
    desc: 'Arte italiana nas paredes do salão.', benefit: 'Satisfação +3 · movimento +5%', capacity: '5 quadros',
    upgrades: [{ price: 700, level: 4, benefit: 'Satisfação +5 · movimento +8%', fx: { comfort: 5, attraction: 0.08 } }] },
  { id: 'barrels', name: 'Barris de carvalho', category: 'Decoração', price: 420, level: 2, icon: 'Beer', spot: [-6.8, 2.4], fx: { comfort: 2, tip: 1.1 },
    desc: 'Um cantinho rústico que deixa o cliente de bom humor.', benefit: 'Satisfação +2 · gorjetas +10%', capacity: '2 barris' },
  { id: 'lights', name: 'Luminárias pendentes', category: 'Decoração', price: 500, level: 2, icon: 'Lightbulb', spot: [-1.5, 2.4], fx: { comfort: 4 },
    desc: 'Iluminação quente e aconchegante sobre as mesas.', benefit: 'Satisfação +4', capacity: '6 pendentes',
    upgrades: [{ price: 1200, level: 5, benefit: 'Satisfação +6', fx: { comfort: 6 } }] },
  { id: 'neon', name: 'Neon de parede', category: 'Decoração', price: 1000, level: 4, icon: 'Zap', spot: [6.5, 4.2], fx: { comfort: 2, attraction: 0.08 },
    desc: 'Perfeito para a foto: todo mundo posta e marca a casa.', benefit: 'Satisfação +2 · movimento +8%', capacity: '1,2 m de neon' },
]

export const shopItemById = (id) => SHOP_ITEMS.find((i) => i.id === id)

// Quantidade total de níveis do item (1 + melhorias)
export const itemMaxLevel = (item) => 1 + (item.upgrades?.length || 0)
export const TOTAL_ITEM_LEVELS = SHOP_ITEMS.reduce((a, i) => a + itemMaxLevel(i), 0)

// Dados da próxima compra do item (null se já está no máximo)
export function nextStep(item, owned = 0) {
  if (!owned) return { price: item.price, level: item.level, benefit: item.benefit, tier: 1 }
  const up = item.upgrades?.[owned - 1]
  return up ? { ...up, tier: owned + 1 } : null
}

// Efeitos atuais do item no nível possuído
export function itemFx(item, owned) {
  if (!owned) return null
  return owned === 1 ? item.fx : item.upgrades?.[owned - 2]?.fx
}

// Coleções: ter todos os itens listados dá um bônus permanente
export const COLLECTIONS = [
  { id: 'cantina', name: 'Cantina Italiana', items: ['paintings', 'plants', 'barrels', 'bunting', 'wine'], benefit: 'Satisfação +4 · movimento +10%', fx: { comfort: 4, attraction: 0.1 } },
  { id: 'pro', name: 'Cozinha Profissional', items: ['fridge', 'freezer', 'shelves', 'mixer', 'hood', 'ferment'], benefit: 'Preparo 10% mais rápido · desgaste −15%', fx: { prep: 0.9, wear: 0.85 } },
  { id: 'lounge', name: 'Salão Aconchegante', items: ['booths', 'lights', 'heatlamp', 'ac', 'fans', 'music'], benefit: 'Satisfação +3 · paciência +15%', fx: { comfort: 3, patience: 0.15 } },
  { id: 'tech', name: 'Pizzaria Conectada', items: ['register', 'tablet', 'totem', 'wifi', 'tv'], benefit: 'Caixa 10% mais rápido · movimento +8%', fx: { register: 0.9, attraction: 0.08 } },
]
export const collectionDone = (c, owned) => c.items.every((id) => owned?.[id])
