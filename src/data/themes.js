// Opções de personalização (modo Editar)
export const THEMES = {
  wall: {
    label: 'Pintura das paredes', cost: 120,
    options: { creme: { name: 'Creme', color: '#f3e6cf' }, terracota: { name: 'Terracota', color: '#eab79c' }, menta: { name: 'Menta', color: '#cfe6d6' }, ceu: { name: 'Azul céu', color: '#cfdcf0' }, lavanda: { name: 'Lavanda', color: '#ddd3ec' } },
  },
  floor: {
    label: 'Piso do salão', cost: 200,
    options: { carvalho: { name: 'Carvalho', color: '#c8925c' }, nogueira: { name: 'Nogueira', color: '#9b6a43' }, clara: { name: 'Madeira clara', color: '#dcb88a' }, cinza: { name: 'Cinza rústico', color: '#a89f96' } },
  },
  cloth: {
    label: 'Toalhas e estofados', cost: 80,
    options: { vermelho: { name: 'Vermelho', color: '#d8453a' }, verde: { name: 'Verde', color: '#3f9a5a' }, azul: { name: 'Azul', color: '#3b6fb6' }, mostarda: { name: 'Mostarda', color: '#d9a23a' } },
  },
}
export const themeColor = (key, value) => THEMES[key].options[value]?.color || Object.values(THEMES[key].options)[0].color
