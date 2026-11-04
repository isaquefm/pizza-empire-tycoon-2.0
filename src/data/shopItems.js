// Catálogo da loja. Cada item altera os sistemas do jogo (ver systems/economy.js)
// e aparece no cenário 3D quando adquirido.
// `level` = nível mínimo da unidade; `requires` = outro item/expansão necessário.
export const SHOP_CATEGORIES = ['Tudo', 'Cozinha', 'Máquinas', 'Salão', 'Conforto', 'Decoração']

export const SHOP_ITEMS = [
  // ---- Cozinha
  { id: 'prep2', name: 'Bancada de preparo', category: 'Cozinha', price: 250, level: 1, icon: 'Utensils', tag: 'MAIS VENDIDO',
    desc: 'Mais uma estação de montagem para preparar pizzas em paralelo.', benefit: '+1 estação de preparo', capacity: 'Capacidade: 2 pizzas simultâneas' },
  { id: 'fridge', name: 'Geladeira industrial', category: 'Cozinha', price: 400, level: 1, icon: 'Refrigerator',
    desc: 'Ingredientes frescos e bem armazenados reduzem o desperdício.', benefit: 'Ingredientes −20% no custo', capacity: 'Estoque +20%' },
  { id: 'shelves', name: 'Prateleiras de ingredientes', category: 'Cozinha', price: 300, level: 2, icon: 'Package',
    desc: 'Tudo à mão: molhos, queijos e coberturas organizados.', benefit: 'Preparo 15% mais rápido', capacity: '24 potes de ingredientes' },
  { id: 'prep3', name: 'Bancada dupla de montagem', category: 'Cozinha', price: 900, level: 4, icon: 'ChefHat', requires: 'kitchen',
    desc: 'Terceira estação de preparo para cozinhas movimentadas.', benefit: '+1 estação de preparo', capacity: 'Capacidade: 3 pizzas simultâneas' },
  // ---- Máquinas
  { id: 'register', name: 'Caixa registradora moderna', category: 'Máquinas', price: 350, level: 1, icon: 'Calculator',
    desc: 'Terminal com cartão e PIX: pedidos e pagamentos muito mais ágeis.', benefit: 'Atendimento no caixa 30% mais rápido', capacity: '1 terminal' },
  { id: 'mixer', name: 'Masseira automática', category: 'Máquinas', price: 650, level: 3, icon: 'Cog',
    desc: 'Massa sempre no ponto, sem esforço manual.', benefit: 'Preparo 20% mais rápido', capacity: '10 kg de massa por ciclo' },
  { id: 'oven2', name: 'Segundo forno a lenha', category: 'Máquinas', price: 1200, level: 3, icon: 'Flame', tag: 'RECOMENDADO',
    desc: 'Dobre a capacidade de assar pizzas ao mesmo tempo.', benefit: '+2 pizzas no forno', capacity: 'Total: 4 pizzas assando' },
  { id: 'oven3', name: 'Terceiro forno a lenha', category: 'Máquinas', price: 3200, level: 6, icon: 'Flame', requires: 'kitchen',
    desc: 'Para uma cozinha de alto volume.', benefit: '+2 pizzas no forno', capacity: 'Total: 6 pizzas assando' },
  // ---- Salão
  { id: 'heatlamp', name: 'Lâmpadas de aquecimento', category: 'Salão', price: 280, level: 1, icon: 'Lamp',
    desc: 'As pizzas aguardam quentinhas na área de retirada.', benefit: 'Satisfação +4', capacity: '4 pizzas aquecidas' },
  { id: 'booths', name: 'Cadeiras estofadas', category: 'Salão', price: 700, level: 2, icon: 'Armchair',
    desc: 'Troca as cadeiras de madeira por assentos acolchoados.', benefit: 'Conforto +8 · paciência +10%', capacity: 'Todas as mesas' },
  // ---- Conforto
  { id: 'drink', name: 'Bebedouro', category: 'Conforto', price: 150, level: 1, icon: 'GlassWater',
    desc: 'Água geladinha para clientes e equipe durante o expediente.', benefit: 'Satisfação +5', capacity: '20 L' },
  { id: 'music', name: 'Sistema de som ambiente', category: 'Conforto', price: 450, level: 2, icon: 'Music',
    desc: 'Uma trilha suave deixa a espera mais agradável.', benefit: 'Satisfação +4 · paciência +10%', capacity: '4 caixas de som' },
  { id: 'ac', name: 'Ar-condicionado', category: 'Conforto', price: 800, level: 3, icon: 'Snowflake',
    desc: 'Clima agradável o dia todo no salão.', benefit: 'Paciência +25%', capacity: '24.000 BTU' },
  // ---- Decoração
  { id: 'sign', name: 'Fachada iluminada', category: 'Decoração', price: 320, level: 1, icon: 'Sparkles',
    desc: 'Letreiro neon e lâmpadas que deixam a pizzaria inconfundível.', benefit: 'Reputação +3 · movimento +12%', capacity: 'Fachada completa' },
  { id: 'plants', name: 'Plantas decorativas', category: 'Decoração', price: 180, level: 1, icon: 'Sprout',
    desc: 'Vasos e folhagens deixam o ambiente vivo e acolhedor.', benefit: 'Satisfação +3', capacity: '6 vasos' },
  { id: 'paintings', name: 'Quadros e murais', category: 'Decoração', price: 260, level: 2, icon: 'Frame',
    desc: 'Arte italiana nas paredes do salão.', benefit: 'Satisfação +3 · movimento +5%', capacity: '5 quadros' },
  { id: 'lights', name: 'Luminárias pendentes', category: 'Decoração', price: 500, level: 2, icon: 'Lightbulb',
    desc: 'Iluminação quente e aconchegante sobre as mesas.', benefit: 'Satisfação +4', capacity: '6 pendentes' },
]

export const shopItemById = (id) => SHOP_ITEMS.find((i) => i.id === id)
