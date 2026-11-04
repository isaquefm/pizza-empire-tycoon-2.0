// Pequena cidade ao redor da pizzaria: ruas, calçadas, estacionamento,
// faixas, praça, prédios vizinhos, árvores, postes e trânsito animado.
import React, { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat, G, roundedBox } from '../materials'
import { asphalt, pavers, grass, brick, plaster, stripes, shopSign } from '../textures'
import { Tree, StreetLamp, Bench, Car, Plant } from '../Restaurant/Props'

const ROAD_Z = 10.8 // centro da rua da frente
const ROAD_W = 5
const BACK_ROAD_Z = -9
const SIDE_ROAD_X = -19.5

function Ground() {
  return <group>
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 4]} scale={[110, 80, 1]} material={mat('#ffffff', { map: grass([40, 30]), r: 1 })} receiveShadow />
    {/* calçada do quarteirão da pizzaria */}
    <mesh geometry={G.box} position={[-1, 0.04, 7.3]} scale={[40, 0.08, 2.0]} material={mat('#ffffff', { map: pavers('#ddd7cb', [24, 1.2]), r: 0.9 })} receiveShadow />
    <mesh geometry={G.box} position={[-1, 0.04, -7.2]} scale={[40, 0.08, 1.8]} material={mat('#ffffff', { map: pavers('#ddd7cb', [24, 1.1]), r: 0.9 })} receiveShadow />
    {/* meio-fio */}
    <mesh geometry={G.box} position={[-1, 0.06, 8.32]} scale={[40, 0.12, 0.12]} material={mat('#b9b3a6')} />
    {/* calçada lateral até a varanda */}
    <mesh geometry={G.box} position={[8.45, 0.04, 0]} scale={[0.7, 0.08, 12.6]} material={mat('#ffffff', { map: pavers('#ddd7cb', [1, 8]), r: 0.9 })} receiveShadow />
  </group>
}

function Roads() {
  const lineM = mat('#f4efe0', { r: 0.8 })
  const yellow = mat('#f2c14e', { r: 0.8 })
  return <group>
    {/* rua da frente */}
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, ROAD_Z]} scale={[110, ROAD_W, 1]} material={mat('#ffffff', { map: asphalt([40, 2]), r: 0.95 })} receiveShadow />
    {Array.from({ length: 26 }, (_, i) => <mesh key={i} geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[-52 + i * 4.2, 0.012, ROAD_Z + 0.4]} scale={[1.8, 0.12, 1]} material={yellow} />)}
    {/* vagas de estacionamento */}
    {Array.from({ length: 10 }, (_, i) => <mesh key={i} geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[-16 + i * 3.4, 0.012, 9.1]} scale={[0.08, 1.4, 1]} material={lineM} />)}
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[-0.7, 0.012, 9.8]} scale={[30.6, 0.08, 1]} material={lineM} />
    {/* rua dos fundos */}
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, BACK_ROAD_Z]} scale={[110, 3.4, 1]} material={mat('#ffffff', { map: asphalt([40, 1.4]), r: 0.95 })} receiveShadow />
    {/* rua lateral e cruzamento */}
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[SIDE_ROAD_X, 0.006, 4]} scale={[4.6, 80, 1]} material={mat('#ffffff', { map: asphalt([2, 30]), r: 0.95 })} receiveShadow />
    {/* faixas de pedestres */}
    {Array.from({ length: 8 }, (_, i) => <mesh key={`a${i}`} geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[DOOR_CROSS_X, 0.014, ROAD_Z - 2.1 + i * 0.6]} scale={[2.6, 0.34, 1]} material={lineM} />)}
    {Array.from({ length: 7 }, (_, i) => <mesh key={`b${i}`} geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[SIDE_ROAD_X - 1.8 + i * 0.6, 0.014, ROAD_Z - 4.0]} scale={[0.34, 2.4, 1]} material={lineM} />)}
    {Array.from({ length: 7 }, (_, i) => <mesh key={`c${i}`} geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[SIDE_ROAD_X - 1.8 + i * 0.6, 0.014, ROAD_Z + 4.0]} scale={[0.34, 2.4, 1]} material={lineM} />)}
  </group>
}
const DOOR_CROSS_X = 1.5

// Prédio vizinho com fachada de loja
const Shop = memo(function Shop({ position, rotation = 0, w = 6, d = 6, h = 4.2, wall = '#e8d8bf', brickColor, sign, signBg, awning = '#3b6fb6', floors = 1 }) {
  const wallM = brickColor ? mat('#ffffff', { map: brick(brickColor, [w / 2, h / 1.6]), r: 0.9 }) : mat('#ffffff', { map: plaster(wall, [w / 3, h / 3]), r: 0.9 })
  const frame = mat('#f4efe6', { r: 0.6 })
  const glass = mat('#9fc8dc', { r: 0.05, m: 0.2 })
  return <group position={position} rotation={[0, rotation, 0]}>
    <mesh geometry={G.box} material={wallM} position={[0, h / 2, 0]} scale={[w, h, d]} castShadow receiveShadow />
    <mesh geometry={G.box} material={mat('#6b7280', { r: 0.7 })} position={[0, h + 0.08, 0]} scale={[w + 0.25, 0.16, d + 0.25]} castShadow />
    {/* vitrine e porta (frente = +z) */}
    <mesh geometry={G.box} material={glass} position={[-w * 0.15, 1.25, d / 2 + 0.01]} scale={[w * 0.5, 1.5, 0.05]} />
    <mesh geometry={G.box} material={frame} position={[-w * 0.15, 0.45, d / 2 + 0.03]} scale={[w * 0.54, 0.1, 0.1]} />
    <mesh geometry={G.box} material={mat('#5a3d2a')} position={[w * 0.3, 1.05, d / 2 + 0.01]} scale={[0.9, 2.0, 0.06]} />
    <mesh geometry={G.box} material={mat('#ffffff', { map: stripes(awning, '#fff6e8', [8, 1]), r: 0.8 })} position={[-w * 0.05, 2.35, d / 2 + 0.55]} rotation={[-0.45, 0, 0]} scale={[w * 0.85, 0.04, 1.2]} castShadow />
    {sign && <mesh geometry={G.plane} material={mat('#ffffff', { map: shopSign(sign, signBg) })} position={[0, h - 0.9, d / 2 + 0.03]} scale={[w * 0.6, w * 0.6 * 0.22, 1]} />}
    {/* janelas dos andares superiores */}
    {floors > 1 && Array.from({ length: floors - 1 }, (_, f) => [-1, 0, 1].map((k) => <group key={`${f}${k}`} position={[k * w * 0.3, 4.4 + f * 2.6, d / 2 + 0.02]}>
      <mesh geometry={G.box} material={glass} scale={[0.9, 1.2, 0.04]} />
      <mesh geometry={G.box} material={frame} scale={[1.05, 0.1, 0.1]} position={[0, -0.62, 0]} />
    </group>))}
  </group>
})

const ShopTall = (p) => <Shop {...p} />

// Praça do outro lado da rua (baixa, para não cobrir a vista)
function Plaza() {
  return <group position={[0, 0, 19]}>
    <mesh geometry={G.box} position={[0, 0.04, -4.6]} scale={[60, 0.08, 1.8]} material={mat('#ffffff', { map: pavers('#ddd7cb', [36, 1]), r: 0.9 })} receiveShadow />
    <mesh geometry={G.box} position={[0, 0.06, -5.52]} scale={[60, 0.12, 0.12]} material={mat('#b9b3a6')} />
    <mesh geometry={G.cyl} position={[2, 0.03, 0.5]} scale={[4.2, 0.06, 4.2]} material={mat('#ffffff', { map: pavers('#e4dccd', [6, 6]), r: 0.9 })} receiveShadow />
    {/* chafariz */}
    <group position={[2, 0, 0.5]}>
      <mesh geometry={G.cyl} material={mat('#cfc6b8', { r: 0.7 })} scale={[1.6, 0.5, 1.6]} position={[0, 0.25, 0]} castShadow />
      <mesh geometry={G.cyl} material={mat('#6fb7d8', { r: 0.05, m: 0.1 })} scale={[1.42, 0.05, 1.42]} position={[0, 0.48, 0]} />
      <mesh geometry={G.cyl} material={mat('#cfc6b8')} scale={[0.2, 1.1, 0.2]} position={[0, 0.9, 0]} />
      <mesh geometry={G.sphereLo} material={mat('#9ed7ee', { op: 0.7 })} scale={[0.35, 0.2, 0.35]} position={[0, 1.5, 0]} />
    </group>
    {[[-6, -2, 1.1, 0], [-11, 1, 1.2, 1], [9, -1.5, 1.0, 2], [14, 1.5, 1.2, 0], [-16, -1, 1.1, 2], [20, -2, 1.0, 1]].map(([x, z, s, t], i) => <group key={i} position={[x, 0, z]}><Tree scale={s} tone={t} /></group>)}
    {[[-3, -2.3], [7, -2.3]].map(([x, z], i) => <group key={i} position={[x, 0.08, z]} rotation={[0, Math.PI, 0]}><Bench /></group>)}
    {[[-8, 1.5], [12, -0.5], [-1.5, 3]].map(([x, z], i) => <group key={i} position={[x, 0.02, z]}><Plant kind={1} scale={1.3} pot="#8fb36f" /></group>)}
  </group>
}

// Carros circulando pela rua da frente
function Traffic() {
  const cars = useMemo(() => [
    { color: '#4c8fd6', lane: 1, x: -30, speed: 5.2, kind: 0 },
    { color: '#f2c14e', lane: -1, x: 10, speed: 4.4, kind: 1 },
    { color: '#7cbf6b', lane: 1, x: 18, speed: 6, kind: 0 },
    { color: '#a76bc9', lane: -1, x: -22, speed: 5, kind: 0 },
  ], [])
  const refs = useRef([])
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    cars.forEach((c, i) => {
      c.x += c.lane * c.speed * d
      if (c.x > 50) c.x = -50
      if (c.x < -50) c.x = 50
      const g = refs.current[i]
      if (g) g.position.x = c.x
    })
  })
  return <group>
    {cars.map((c, i) => <group key={i} ref={(r) => { refs.current[i] = r }} position={[c.x, 0, ROAD_Z + (c.lane > 0 ? 1.2 : -0.6) + 0.3]} rotation={[0, c.lane > 0 ? 0 : Math.PI, 0]}>
      <Car color={c.color} kind={c.kind} />
    </group>)}
  </group>
}

function StreetProps({ lampsOn }) {
  return <group>
    {/* árvores da calçada (afastadas da fachada principal) */}
    {[[-14.5, 7.7, 1.05, 0], [-10.2, 7.8, 0.95, 1], [10.8, 7.7, 1.0, 2], [15.5, 7.8, 1.05, 0], [-17.5, -7.4, 1.1, 1], [12, -7.4, 1.0, 2], [3, -7.4, 0.9, 0], [-6, -7.4, 1.0, 1]].map(([x, z, s, t], i) =>
      <group key={i} position={[x, 0.08, z]}><Tree scale={s} tone={t} /></group>)}
    {[[-12.5, 8.0, 0], [-1.5, 8.0, 0], [13.3, 8.0, 0], [17.6, 8.0, 0]].map(([x, z, r], i) => <group key={i} position={[x, 0.08, z]} rotation={[0, r, 0]}><StreetLamp on={lampsOn} /></group>)}
    <group position={[-12.3, 0.08, 6.7]}><Bench /></group>
    {/* hidrante, lixeira, caixa de correio, bicicletário */}
    <group position={[-8.6, 0.08, 7.9]}>
      <mesh geometry={G.cyl} material={mat('#d23b2f', { r: 0.4 })} scale={[0.14, 0.6, 0.14]} position={[0, 0.3, 0]} castShadow />
      <mesh geometry={G.sphereLo} material={mat('#d23b2f', { r: 0.4 })} scale={0.15} position={[0, 0.62, 0]} />
      <mesh geometry={G.cyl} material={mat('#d23b2f')} scale={[0.06, 0.25, 0.06]} rotation={[0, 0, Math.PI / 2]} position={[0, 0.4, 0]} />
    </group>
    <group position={[3.0, 0.08, 8.0]}>
      <mesh geometry={G.cyl} material={mat('#3f8247', { r: 0.6 })} scale={[0.25, 0.8, 0.25]} position={[0, 0.4, 0]} castShadow />
      <mesh geometry={G.cyl} material={mat('#2f6b3a')} scale={[0.27, 0.06, 0.27]} position={[0, 0.82, 0]} />
    </group>
    <group position={[-9.2, 0.08, 6.6]}>
      <mesh geometry={roundedBox(0.5, 0.9, 0.4, 0.06)} material={mat('#f2c14e', { r: 0.4 })} position={[0, 0.85, 0]} castShadow />
      <mesh geometry={G.cyl} material={mat('#2f3b52')} scale={[0.05, 0.45, 0.05]} position={[0, 0.22, 0]} />
    </group>
    <group position={[-4.5, 0.08, 6.6]}>
      {[0, 1, 2, 3].map((i) => <mesh key={i} geometry={G.torus} material={mat('#9aa3ad', { m: 0.7, r: 0.3 })} scale={[0.32, 0.38, 0.5]} position={[i * 0.45, 0.32, 0]} rotation={[0, Math.PI / 2, 0]} />)}
    </group>
    {/* carros estacionados */}
    {[[-14.3, '#e45d50', 0], [-7.5, '#f4efe6', 1], [-0.7, '#3b4a5e', 0], [12.9, '#3fa39a', 1]].map(([x, c, k], i) => <group key={i} position={[x, 0, 9.1]} rotation={[0, i % 2 ? Math.PI : 0, 0]}><Car color={c} kind={k} /></group>)}
    {/* placa "PIZZA" vertical na esquina */}
    <group position={[8.45, 0.08, 6.6]}>
      <mesh geometry={G.cyl} material={mat('#2f3b52', { r: 0.4, m: 0.5 })} scale={[0.08, 4.2, 0.08]} position={[0, 2.1, 0]} castShadow />
      <mesh geometry={roundedBox(0.85, 2.2, 0.22, 0.08)} material={mat('#d8453a', { r: 0.45 })} position={[0, 3.4, 0]} castShadow />
      {'PIZZA'.split('').map((ch, i) => <mesh key={i} geometry={G.plane} position={[0, 4.2 - i * 0.4, 0.115]} scale={[0.5, 0.36, 1]} material={mat('#ffffff', { map: shopSign(ch, '#d8453a', '#fff6df'), e: lampsOn ? '#ffffff' : '#000000', ei: lampsOn ? 0.4 : 0 })} />)}
    </group>
  </group>
}

function Neighbors() {
  return <group>
    {/* à esquerda */}
    <Shop position={[-12.7, 0, -0.3]} w={6.4} d={11.6} h={4.6} wall="#f1d9a8" sign="CAFÉ AROMA" signBg="#7a4a2e" awning="#7a4a2e" />
    <Shop position={[-24.5, 0, 1]} w={6} d={8} h={9.2} brickColor="#9a5a48" sign="FARMÁCIA" signBg="#2f9e5b" awning="#2f9e5b" floors={3} />
    {/* à direita, depois da varanda */}
    <Shop position={[19.5, 0, 0.3]} w={6.4} d={10} h={5} wall="#cfe0ec" sign="MERCADINHO" signBg="#3b6fb6" awning="#3b6fb6" />
    <Shop position={[27, 0, 0]} w={6} d={9} h={7.8} brickColor="#b07a5a" sign="LIVRARIA" signBg="#6a4fb6" awning="#6a4fb6" floors={2} />
    {/* fundos (prédios altos ao fundo) */}
    {[[-14, '#d9c3a5', 10.4, 3], [-6.5, '#c7d6e2', 12.8, 4], [1.5, '#e6c3b8', 9.8, 3], [9.5, '#d8d2bf', 13.2, 4], [17.5, '#cbbfdc', 10.6, 3]].map(([x, c, h, f], i) =>
      <ShopTall key={i} position={[x, 0, -14.5]} w={7.2} d={6} h={h} wall={c} floors={f} sign={i === 2 ? 'HOTEL' : i === 4 ? 'ACADEMIA' : null} signBg={i === 2 ? '#2f3b52' : '#d8453a'} awning={['#d8453a', '#3fa39a', '#f2a03a', '#3b6fb6', '#a76bc9'][i]} />)}
  </group>
}

export const City = memo(function City({ lampsOn }) {
  return <group>
    <Ground />
    <Roads />
    <Plaza />
    <Neighbors />
    <StreetProps lampsOn={lampsOn} />
    <Traffic />
  </group>
})

export { ROAD_Z }
