// Layout físico do restaurante (unidades ≈ metros).
// Interior: x ∈ [-8, 8], z ∈ [-6, 6]. A frente (rua) fica em +z.

export const ROOM = { minX: -8, maxX: 8, minZ: -6, maxZ: 6, wallH: 3.1, wallT: 0.22 }

export const DOOR = { x: 5.6, width: 1.6 }
export const DOOR_IN = { x: 5.6, z: 5.2 }
export const DOOR_OUT = { x: 5.6, z: 7.1 }

// Pontos de surgimento dos clientes na calçada
export const SPAWNS = [
  { x: -17, z: 7.4 },
  { x: 17, z: 7.4 },
]

// Cozinha — encostada na parede do fundo
export const KITCHEN = {
  fridge: { x: -7.1, z: -5.35, front: { x: -7.1, z: -4.3 } },
  fridge2: { x: -6.0, z: -5.35, front: { x: -6.0, z: -4.3 } },
  shelves: { x: -4.85, z: -5.7 },
  sink: { x: 6.1, z: -5.4, front: { x: 6.1, z: -4.4 } },
}

// Bancadas de preparo (até 3) e fornos (até 3)
export const PREP_STATIONS = [
  { x: -3.6, z: -5.25, front: { x: -3.6, z: -4.3 } },
  { x: -2.0, z: -5.25, front: { x: -2.0, z: -4.3 } },
  { x: -0.4, z: -5.25, front: { x: -0.4, z: -4.3 } },
]
export const OVENS = [
  { x: 1.4, z: -5.2, front: { x: 1.4, z: -4.2 } },
  { x: 2.9, z: -5.2, front: { x: 2.9, z: -4.2 } },
  { x: 4.4, z: -5.2, front: { x: 4.4, z: -4.2 } },
]

// Balcão de atendimento (caixa + retirada)
export const COUNTER = { z: -2.3, depth: 0.7, minX: -2.6, maxX: 4.4 }
export const REGISTER = {
  x: -1.6,
  staff: { x: -1.6, z: -3.05 },
  customer: { x: -1.6, z: -1.45 },
}
// Fila de clientes: segue para a esquerda a partir do caixa
export const queueSpot = (i) => ({ x: -1.6 - i * 0.72, z: -1.45 })
export const QUEUE_MAX = 7
// Fila de pagamento (ao lado do caixa, prioritária)
export const paySpot = (i) => (i === 0 ? { x: -0.75, z: -1.45 } : { x: -0.45, z: -1.45 + i * 0.62 })
export const PAY_MAX = 4

// Retirada: lado de dentro (cozinha finaliza) e lado de fora (garçom pega)
export const PICKUP = {
  slots: [
    { x: 1.0, z: -2.3 },
    { x: 1.8, z: -2.3 },
    { x: 2.6, z: -2.3 },
    { x: 3.4, z: -2.3 },
  ],
  back: { x: 2.2, z: -3.1 },
  front: { x: 2.2, z: -1.5 },
  wait: [
    { x: 3.6, z: -1.2 },
    { x: 4.2, z: -0.7 },
    { x: 3.0, z: -0.6 },
  ],
}

// Passagem cozinha ↔ salão (à direita do balcão)
export const PASSAGE = { x: 5.4, z: -2.3 }

// Posições das mesas (cada mesa = 2 lugares). As 10 primeiras ficam no salão,
// as 6 seguintes na varanda (expansão).
export const TABLE_SLOTS = [
  { x: 0.8, z: 0.9 }, { x: -1.6, z: 0.9 }, { x: 3.2, z: 0.9 }, { x: -4.0, z: 0.9 }, { x: -6.4, z: 0.9 },
  { x: 0.8, z: 3.9 }, { x: -1.6, z: 3.9 }, { x: 3.2, z: 3.9 }, { x: -4.0, z: 3.9 }, { x: -6.4, z: 3.9 },
  // Varanda externa (lado direito)
  { x: 10.4, z: -3.2, terrace: true }, { x: 13.4, z: -3.2, terrace: true },
  { x: 10.4, z: -0.2, terrace: true }, { x: 13.4, z: -0.2, terrace: true },
  { x: 10.4, z: 2.8, terrace: true }, { x: 13.4, z: 2.8, terrace: true },
]
export const INTERIOR_TABLES = 10
export const MAX_TABLES = TABLE_SLOTS.length

export const TERRACE = { minX: 8.9, maxX: 15.0, minZ: -4.6, maxZ: 4.4 }

// Scooter de entrega
export const SCOOTER = { x: 7.6, z: 7.6 }

// Limites da câmera (o restaurante nunca sai de vista)
export const CAMERA_BOUNDS = { minX: -10, maxX: 14, minZ: -8, maxZ: 12 }

// Obstáculos para o pathfinding: retângulos [minX, minZ, maxX, maxZ]
export function buildObstacles({ terrace }) {
  const t = 0.25
  const o = [
    // Paredes (com a porta na frente)
    [ROOM.minX - t, ROOM.minZ - t, ROOM.maxX + t, ROOM.minZ + t],
    [ROOM.minX - t, ROOM.minZ, ROOM.minX + t, ROOM.maxZ + t],
    [ROOM.maxX - t, ROOM.minZ, ROOM.maxX + t, ROOM.maxZ + t],
    [ROOM.minX, ROOM.maxZ - t, DOOR.x - DOOR.width / 2, ROOM.maxZ + t],
    [DOOR.x + DOOR.width / 2, ROOM.maxZ - t, ROOM.maxX, ROOM.maxZ + t],
    // Equipamentos da parede do fundo
    [-8, -6, 7.0, -4.75],
    // Balcão + divisória esquerda (bebidas)
    [COUNTER.minX, COUNTER.z - 0.4, COUNTER.maxX, COUNTER.z + 0.4],
    [-8, COUNTER.z - 0.4, -4.6, COUNTER.z + 0.4],
    // Prateleira de delivery à direita da passagem
    [6.5, COUNTER.z - 0.4, 8, COUNTER.z + 0.4],
  ]
  // Mesas (sem as cadeiras — elas são os destinos)
  TABLE_SLOTS.forEach((s) => o.push([s.x - 0.45, s.z - 0.45, s.x + 0.45, s.z + 0.45]))
  // Prédios vizinhos e canteiros
  o.push([-16, -7, -9.4, 5.6]) // vizinho esquerdo
  if (!terrace) o.push([8.6, -6, 15.4, 5.0]) // lote vazio cercado
  else {
    o.push([8.3, -6, 15.4, -4.8]) // fundo da varanda
    o.push([15.2, -6, 15.6, 5.0])
  }
  return o
}

// Lugares: cada mesa tem 2 cadeiras viradas uma para a outra (eixo x)
export function seatsForTable(idx) {
  const s = TABLE_SLOTS[idx]
  return [
    { x: s.x - 0.68, z: s.z, rot: Math.PI / 2, approach: { x: s.x - 0.75, z: s.z + 0.75 } },
    { x: s.x + 0.68, z: s.z, rot: -Math.PI / 2, approach: { x: s.x + 0.75, z: s.z + 0.75 } },
  ]
}
