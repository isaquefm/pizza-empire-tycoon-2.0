// Pizzaria completa: piso, paredes, cozinha, balcão, salão, decoração,
// fachada e varanda. Itens comprados na loja aparecem aqui.
import React, { memo } from 'react'
import * as THREE from 'three'
import { useGame } from '../../systems/store'
import { world } from '../../systems/world'
import { useWorldSnapshot } from '../../hooks/useWorldSnapshot'
import { mat, G, roundedBox } from '../materials'
import { woodFloor, checkerTile, subwayTile, signTexture, menuBoard, painting, labelTexture, stripes, deck, glow } from '../textures'
import { ROOM, DOOR, PREP_STATIONS, OVENS, COUNTER, REGISTER, PICKUP, KITCHEN, TABLE_SLOTS, TERRACE, seatsForTable } from '../../data/layout'
import { themeColor } from '../../data/themes'
import { Wall } from './Walls'
import { PizzaModel, PizzaBox, DiningTable, Chair, Plant, PizzaOven, PrepCounter, Fridge, Shelf, PendantLamp, WallFrame } from './Props'

const W = ROOM.maxX - ROOM.minX, D = ROOM.maxZ - ROOM.minZ

function Floors({ floorColor }) {
  const kitchenDepth = 3.7
  return <group>
    {/* fundação */}
    <mesh geometry={G.box} material={mat('#d8cfc2', { r: 0.9 })} position={[0, 0.04, 0]} scale={[W + 0.6, 0.08, D + 0.6]} receiveShadow />
    {/* salão: tábuas */}
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.082, ROOM.minZ + kitchenDepth + (D - kitchenDepth) / 2]} scale={[W, D - kitchenDepth, 1]}
      material={mat('#ffffff', { map: woodFloor(floorColor, [W / 2.4, (D - kitchenDepth) / 2.4]), r: 0.75 })} receiveShadow />
    {/* cozinha: piso xadrez */}
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.083, ROOM.minZ + kitchenDepth / 2]} scale={[W, kitchenDepth, 1]}
      material={mat('#ffffff', { map: checkerTile('#f2ede4', '#3b4a5e', [W / 1.2, kitchenDepth / 1.2]), r: 0.45 })} receiveShadow />
    {/* tapetes */}
    <mesh geometry={roundedBox(1.6, 0.02, 1.0, 0.01)} material={mat('#7a3a33', { r: 1 })} position={[DOOR.x, 0.09, 5.3]} receiveShadow />
    <mesh geometry={roundedBox(5.4, 0.015, 0.9, 0.01)} material={mat('#c0453b', { r: 1 })} position={[-3.6, 0.09, -1.45]} receiveShadow />
  </group>
}

// Vaga ainda não comprada (contorno no piso)
function EmptySlot({ w = 1.3, d = 0.9, label }) {
  return <group>
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]} scale={[w, d, 1]} material={mat('#9aa7b8', { basic: true, op: 0.28 })} />
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.095, 0]} scale={[w * 0.8, d * 0.35, 1]} material={mat('#ffffff', { basic: true, map: labelTexture(label, { bg: '#5d6b80', size: 54 }), op: 0.85 })} />
  </group>
}

function Kitchen({ owned, expansions, ovenLevel, snap }) {
  return <group>
    {/* Geladeiras */}
    <group position={[KITCHEN.fridge.x, 0.08, KITCHEN.fridge.z]}><Fridge /></group>
    {owned.fridge
      ? <group position={[KITCHEN.fridge2.x, 0.08, KITCHEN.fridge2.z]}><Fridge glass /></group>
      : <group position={[KITCHEN.fridge2.x, 0, KITCHEN.fridge2.z + 0.2]}><EmptySlot w={0.95} d={0.75} label="GELADEIRA" /></group>}
    {/* Prateleiras de ingredientes */}
    <group position={[KITCHEN.shelves.x, 0.08, KITCHEN.shelves.z]}><Shelf full={!!owned.shelves} width={0.95} /></group>
    {/* Bancadas */}
    {PREP_STATIONS.map((p, i) => {
      const has = i === 0 || (i === 1 && owned.prep2) || (i === 2 && owned.prep3)
      return <group key={i} position={[p.x, 0.08, p.z]}>{has ? <PrepCounter busy={snap.prep[i]} /> : <EmptySlot label={i === 2 && !expansions.kitchen ? 'AMPLIAÇÃO' : 'BANCADA'} />}</group>
    })}
    {/* Fornos */}
    {OVENS.map((o, i) => {
      const has = i === 0 || (i === 1 && owned.oven2) || (i === 2 && owned.oven3)
      return <group key={i} position={[o.x, 0.08, o.z]}>
        {has ? <>
          <PizzaOven fire={snap.fire[i] ?? 0.3} level={ovenLevel} />
          {snap.ovenPizzas[i]?.map((r, k) => r && <group key={k} position={[-0.15 + k * 0.3, 0.92, 0.25]} scale={0.6}><PizzaModel recipe={r} /></group>)}
          <mesh geometry={G.plane} material={mat('#ffffff', { basic: true, map: glow('#ff9a4a'), op: 0.5 + (snap.fire[i] ?? 0) * 0.4 })} position={[0, 0.98, 0.62]} scale={0.9} />
        </> : <EmptySlot w={1.3} d={1.1} label={i === 2 && !expansions.kitchen ? 'AMPLIAÇÃO' : 'FORNO'} />}
      </group>
    })}
    {/* Pia e lava-louças */}
    <group position={[KITCHEN.sink.x, 0.08, KITCHEN.sink.z]}>
      <mesh geometry={roundedBox(1.5, 0.86, 0.8, 0.03)} material={mat('#9ea8b3', { r: 0.35, m: 0.6 })} position={[0, 0.43, 0]} castShadow />
      <mesh geometry={G.box} material={mat('#c4ccd4', { r: 0.25, m: 0.8 })} scale={[1.52, 0.05, 0.82]} position={[0, 0.88, 0]} />
      <mesh geometry={G.box} material={mat('#5c6470', { r: 0.2, m: 0.8 })} scale={[0.6, 0.02, 0.45]} position={[-0.3, 0.91, 0]} />
      <mesh geometry={G.cylLo} material={mat('#c4ccd4', { r: 0.2, m: 0.9 })} scale={[0.025, 0.35, 0.025]} position={[-0.3, 1.08, -0.25]} />
      {[0, 1, 2, 3].map((i) => <mesh key={i} geometry={G.cyl} material={mat('#f7f7f4', { r: 0.3 })} scale={[0.14, 0.015, 0.14]} position={[0.35, 0.92 + i * 0.03, 0.05]} />)}
    </group>
    {/* Prateleira lateral com caixas de pizza */}
    <group position={[7.45, 0.08, -5.4]}>
      <Shelf full={false} width={0.8} />
      {[0, 1, 2, 3, 4].map((i) => <group key={i} position={[0, 0.96 + i * 0.075, 0]} scale={0.9}><PizzaBox /></group>)}
    </group>
    {/* Exaustor sobre os fornos */}
    <mesh geometry={roundedBox(4.8, 0.5, 1.2, 0.06)} material={mat('#b6bec7', { r: 0.25, m: 0.8 })} position={[2.9, 2.55, -5.3]} castShadow />
    {expansions.kitchen && <group position={[-1.6, 0.08, -3.55]}>
      <mesh geometry={roundedBox(1.1, 0.9, 0.55, 0.03)} material={mat('#c4ccd4', { r: 0.25, m: 0.7 })} position={[0, 0.45, 0]} castShadow />
      {[0, 1, 2].map((i) => <mesh key={i} geometry={G.cyl} material={mat('#e7c58f')} scale={[0.15, 0.03, 0.15]} position={[-0.3 + i * 0.3, 0.93, 0]} />)}
    </group>}
  </group>
}

function Counter({ owned, snap, cloth }) {
  const len = COUNTER.maxX - COUNTER.minX, cx = (COUNTER.maxX + COUNTER.minX) / 2
  const wood = mat('#8b5a35', { r: 0.55 })
  return <group>
    {/* balcão principal */}
    <mesh geometry={roundedBox(len, 1.0, COUNTER.depth, 0.04)} material={wood} position={[cx, 0.58, COUNTER.z]} castShadow receiveShadow />
    <mesh geometry={G.box} material={mat('#3b3f4a', { r: 0.25, m: 0.2 })} scale={[len + 0.12, 0.07, COUNTER.depth + 0.12]} position={[cx, 1.11, COUNTER.z]} castShadow />
    {/* painéis frontais */}
    {Array.from({ length: 7 }, (_, i) => <mesh key={i} geometry={roundedBox(0.82, 0.62, 0.04, 0.02)} material={mat(i % 2 ? '#a86e42' : '#9a6238', { r: 0.6 })} position={[COUNTER.minX + 0.5 + i * 1.0, 0.6, COUNTER.z + COUNTER.depth / 2 + 0.01]} />)}
    <mesh geometry={G.box} material={mat(cloth, { r: 0.6 })} scale={[len, 0.08, 0.02]} position={[cx, 1.0, COUNTER.z + COUNTER.depth / 2 + 0.02]} />
    {/* caixa registradora */}
    <group position={[REGISTER.x, 1.15, COUNTER.z - 0.05]}>
      {owned.register ? <>
        <mesh geometry={roundedBox(0.5, 0.06, 0.4, 0.02)} material={mat('#2a2d36', { r: 0.3 })} position={[0, 0.03, 0]} />
        <mesh geometry={G.cylLo} material={mat('#c4ccd4', { m: 0.8, r: 0.2 })} scale={[0.03, 0.25, 0.03]} position={[0, 0.17, -0.05]} />
        <mesh geometry={roundedBox(0.44, 0.3, 0.03, 0.02)} material={mat('#1e2533', { e: '#4a8fe0', ei: 0.35, r: 0.2 })} position={[0, 0.38, -0.02]} rotation={[-0.25, Math.PI, 0]} />
        <mesh geometry={roundedBox(0.1, 0.16, 0.05, 0.015)} material={mat('#2a2d36')} position={[0.3, 0.09, 0.12]} rotation={[-0.4, 0, 0]} />
      </> : <>
        <mesh geometry={roundedBox(0.55, 0.22, 0.45, 0.03)} material={mat('#c8423a', { r: 0.4, m: 0.2 })} position={[0, 0.11, 0]} />
        <mesh geometry={roundedBox(0.45, 0.14, 0.25, 0.02)} material={mat('#e9e3d6', { r: 0.4 })} position={[0, 0.27, -0.06]} rotation={[0.5, 0, 0]} />
        <mesh geometry={G.box} material={mat('#1e2533', { e: '#7be08a', ei: 0.4 })} scale={[0.22, 0.07, 0.05]} position={[0, 0.38, -0.15]} />
      </>}
    </group>
    {/* pote de gorjetas e cardápios */}
    <mesh geometry={G.cyl} material={mat('#e8f3f6', { r: 0.05, op: 0.6 })} scale={[0.07, 0.14, 0.07]} position={[REGISTER.x - 0.55, 1.22, COUNTER.z + 0.15]} />
    <mesh geometry={roundedBox(0.3, 0.4, 0.04, 0.01)} material={mat('#2e3a34')} position={[REGISTER.x + 0.6, 1.35, COUNTER.z + 0.2]} rotation={[-0.25, 0, 0]} />
    {/* área de retirada */}
    <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 1.152, COUNTER.z]} scale={[3.3, 0.5, 1]} material={mat('#c4ccd4', { r: 0.2, m: 0.8 })} />
    <mesh geometry={G.plane} position={[2.2, 1.6, COUNTER.z + 0.36]} scale={[1.4, 0.32, 1]} material={mat('#ffffff', { basic: true, map: labelTexture('RETIRADA', { bg: '#2f9e5b', size: 62 }) })} />
    {PICKUP.slots.map((p, i) => <group key={i} position={[p.x, 1.16, p.z]}>
      <mesh geometry={G.cyl} material={mat('#f7f7f4', { r: 0.3 })} scale={[0.2, 0.01, 0.2]} />
      {snap.pickup[i] && <group position={[0, 0.02, 0]} scale={0.7}>{snap.pickup[i] === 'box' ? <PizzaBox /> : <PizzaModel recipe={snap.pickup[i]} />}</group>}
    </group>)}
    {/* lâmpadas de aquecimento */}
    {[1.4, 3.0].map((x) => <group key={x} position={[x, 2.25, COUNTER.z]}>
      <mesh geometry={G.cylLo} material={mat('#2a2a2e')} scale={[0.008, 0.9, 0.008]} position={[0, 0.45, 0]} />
      <mesh geometry={G.cone} material={mat(owned.heatlamp ? '#d8453a' : '#5d636e', { r: 0.4, m: 0.4, side: THREE.DoubleSide })} scale={[0.3, 0.25, 0.3]} />
      {owned.heatlamp && <mesh geometry={G.sphereLo} material={mat('#ffb36b', { e: '#ff8a3a', ei: 2.5 })} scale={0.09} position={[0, -0.12, 0]} />}
    </group>)}
    {/* divisória esquerda com geladeira de bebidas */}
    <mesh geometry={roundedBox(3.4, 1.0, 0.55, 0.04)} material={wood} position={[-6.3, 0.58, COUNTER.z]} castShadow />
    <mesh geometry={G.box} material={mat('#3b3f4a', { r: 0.25 })} scale={[3.5, 0.07, 0.65]} position={[-6.3, 1.11, COUNTER.z]} />
    <group position={[-6.9, 1.15, COUNTER.z]} scale={0.55}><Fridge glass /></group>
    {[-5.6, -4.95].map((x, i) => <group key={x} position={[x, 1.15, COUNTER.z]} scale={0.6}><Plant kind={i} /></group>)}
    {/* prateleira de delivery */}
    <mesh geometry={roundedBox(1.4, 1.0, 0.6, 0.04)} material={mat('#c8423a', { r: 0.5 })} position={[7.25, 0.58, COUNTER.z]} castShadow />
    <mesh geometry={G.plane} position={[7.25, 0.72, COUNTER.z + 0.31]} scale={[1.2, 0.3, 1]} material={mat('#ffffff', { basic: true, map: labelTexture('DELIVERY', { bg: '#f2c14e', fg: '#2f3b52', size: 60 }) })} />
    {[0, 1, 2].map((i) => <group key={i} position={[7.25, 1.12 + i * 0.075, COUNTER.z]} scale={0.9}><PizzaBox /></group>)}
  </group>
}

function Dining({ tables, owned, cloth, terrace, snap }) {
  return <group>
    {TABLE_SLOTS.slice(0, tables).map((t, i) => {
      if (t.terrace && !terrace) return null
      const seats = seatsForTable(i)
      return <group key={i}>
        <group position={[t.x, 0.08, t.z]}><DiningTable cloth={cloth} upgraded={owned.lights} terrace={t.terrace} /></group>
        {seats.map((s, k) => {
          const info = snap.seats[i * 2 + k]
          return <group key={k}>
            <group position={[s.x + (s.rot > 0 ? -0.05 : 0.05), 0.08, s.z]} rotation={[0, s.rot, 0]}><Chair padded={!!owned.booths} color={cloth} /></group>
            {info?.food && <group position={[t.x + (s.rot > 0 ? -0.22 : 0.22), 0.75, t.z]} scale={0.62}><PizzaModel recipe={info.food === 'empty' ? 'margherita' : info.food} eaten={info.food === 'empty'} /></group>}
            {info?.dirty && <mesh geometry={G.sphereLo} material={mat('#b9b2a4', { r: 1 })} scale={[0.05, 0.01, 0.04]} position={[t.x + (s.rot > 0 ? -0.1 : 0.1), 0.745, t.z + 0.15]} />}
            {/* copo */}
            <mesh geometry={G.cyl} material={mat('#d8eef5', { r: 0.05, op: 0.55 })} scale={[0.035, 0.1, 0.035]} position={[t.x + (s.rot > 0 ? -0.3 : 0.3), 0.76, t.z - 0.22]} />
          </group>
        })}
        {owned.lights && !t.terrace && <group position={[t.x, ROOM.wallH, t.z]}><PendantLamp drop={1.0} color={cloth} /></group>}
        {t.terrace && <group position={[t.x, 0.08, t.z]}>
          <mesh geometry={G.cylLo} material={mat('#f4efe6')} scale={[0.03, 2.3, 0.03]} position={[0, 1.15, 0]} />
          <mesh geometry={G.cone} material={mat('#ffffff', { map: stripes(cloth, '#fff6e8', [8, 1]), r: 0.8, side: THREE.DoubleSide })} scale={[1.25, 0.45, 1.25]} position={[0, 2.35, 0]} castShadow />
        </group>}
      </group>
    })}
  </group>
}

function Decor({ owned, wallColor }) {
  return <group>
    {owned.plants && [[-7.5, 5.5, 0], [-7.5, -1.0, 1], [7.4, 5.4, 0], [3.9, 5.5, 1], [-3.0, 5.55, 0], [7.4, 0.2, 1]].map(([x, z, k], i) =>
      <group key={i} position={[x, 0.08, z]} scale={0.85}><Plant kind={k} pot={i % 2 ? '#3f6fb6' : '#c8643f'} /></group>)}
    {owned.drink && <group position={[-7.45, 0.08, -0.25]}>
      <mesh geometry={roundedBox(0.45, 1.0, 0.45, 0.04)} material={mat('#f4f4f4', { r: 0.4 })} position={[0, 0.5, 0]} castShadow />
      <mesh geometry={G.cyl} material={mat('#8fd0ee', { r: 0.05, op: 0.7 })} scale={[0.17, 0.42, 0.17]} position={[0, 1.22, 0]} />
      <mesh geometry={G.box} material={mat('#3b6fb6')} scale={[0.1, 0.05, 0.06]} position={[0.12, 0.75, 0.24]} />
    </group>}
    {owned.music && [[-7.8, 2.6, 0.5, Math.PI / 2], [-7.8, 2.6, 4.5, Math.PI / 2], [0, 2.6, -5.8, 0]].map(([x, y, z, r], i) =>
      <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
        <mesh geometry={roundedBox(0.3, 0.45, 0.22, 0.03)} material={mat('#2a2d36', { r: 0.4 })} />
        <mesh geometry={G.circle} material={mat('#555b66')} scale={0.09} position={[0, -0.06, 0.112]} />
        <mesh geometry={G.circle} material={mat('#555b66')} scale={0.05} position={[0, 0.12, 0.112]} />
      </group>)}
    {owned.ac && <group position={[-7.75, 2.85, 2.4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh geometry={roundedBox(1.4, 0.4, 0.28, 0.06)} material={mat('#f7f7f7', { r: 0.3 })} castShadow />
      <mesh geometry={G.box} material={mat('#c9ced6')} scale={[1.2, 0.04, 0.02]} position={[0, -0.12, 0.14]} />
      <mesh geometry={G.sphereLo} material={mat('#5ad17a', { e: '#5ad17a', ei: 1 })} scale={0.015} position={[0.6, 0.1, 0.14]} />
    </group>}
  </group>
}

// Quadros/ cardápio presos à parede (filhos da parte superior → somem no corte)
const leftWallDecor = (owned) => <group>
  {owned.paintings && [-2.4, -5.7, 1.4].map((x, i) => <group key={i} position={[x, 2.15, 0.13]}><WallFrame map={painting(i)} w={0.85} h={0.65} /></group>)}
  {[0.4, 3.0, -4.95].map((x) => <group key={x} position={[x, 2.35, 0.2]}>
    <mesh geometry={G.cylLo} material={mat('#2f3b52')} scale={[0.02, 0.15, 0.02]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.07]} />
    <mesh geometry={G.sphereLo} material={mat('#fff3c4', { e: '#ffd88a', ei: 1.8 })} scale={[0.12, 0.08, 0.06]} />
  </group>)}
</group>

const backWallDecor = (owned, lit) => <group>
  {/* azulejos da cozinha */}
  <mesh geometry={G.plane} position={[0, 1.95, 0.115]} scale={[W - 0.3, 1.9, 1]} material={mat('#ffffff', { map: subwayTile('#f4f6f4', [W / 1.2, 3]), r: 0.3 })} />
  <group position={[-3.4, 2.45, 0.16]}><WallFrame map={menuBoard()} w={1.5} h={1.05} frame="#5a3d2a" /></group>
  {owned.paintings && <group position={[-6.6, 2.4, 0.14]}><WallFrame map={painting(3)} w={0.7} h={0.55} /></group>}
  {/* relógio */}
  <group position={[-0.8, 2.5, 0.14]}>
    <mesh geometry={G.cyl} material={mat('#2f3b52')} scale={[0.26, 0.04, 0.26]} rotation={[Math.PI / 2, 0, 0]} />
    <mesh geometry={G.circle} material={mat('#fffaf0')} scale={0.22} position={[0, 0, 0.022]} />
    <mesh geometry={G.box} material={mat('#2f3b52')} scale={[0.015, 0.14, 0.01]} position={[0, 0.06, 0.03]} />
    <mesh geometry={G.box} material={mat('#c8423a')} scale={[0.1, 0.012, 0.01]} position={[0.04, 0, 0.03]} />
  </group>
  {/* letreiro principal no topo */}
  <group position={[0, ROOM.wallH + 0.75, 0]}>
    <mesh geometry={roundedBox(5.4, 1.4, 0.18, 0.06)} material={mat('#2f3b52', { r: 0.5 })} position={[0, 0, -0.05]} castShadow />
    <mesh geometry={G.plane} material={mat('#ffffff', { map: signTexture(lit), e: lit ? '#ffffff' : '#000000', ei: lit ? 0.35 : 0, r: 0.5 })} scale={[5.2, 1.3, 1]} position={[0, 0, 0.05]} />
    {lit && Array.from({ length: 16 }, (_, i) => <mesh key={i} geometry={G.sphereLo} material={mat('#fff1b0', { e: '#ffd24a', ei: 2.4 })} scale={0.05} position={[-2.55 + i * 0.34, i % 2 ? 0.7 : -0.7, 0.1]} />)}
    {[-2, 2].map((x) => <mesh key={x} geometry={G.box} material={mat('#2f3b52')} scale={[0.1, 0.8, 0.1]} position={[x, -0.95, -0.05]} />)}
  </group>
</group>

const frontExterior = (lit, cloth) => <group>
  {/* toldo listrado sobre a porta e janelas (lado de fora = −z local) */}
  <group position={[-DOOR.x, 2.45, -0.75]} rotation={[-0.45, 0, 0]}>
    <mesh geometry={G.box} material={mat('#ffffff', { map: stripes('#d8453a', '#fff6e8', [6, 1]), r: 0.8 })} scale={[2.6, 0.04, 1.4]} castShadow />
  </group>
  {[-1.2, 2.6].map((x) => <group key={x} position={[x, 2.45, -0.7]} rotation={[-0.45, 0, 0]}>
    <mesh geometry={G.box} material={mat('#ffffff', { map: stripes(cloth, '#fff6e8', [8, 1]), r: 0.8 })} scale={[3.2, 0.04, 1.2]} castShadow />
  </group>)}
  <mesh geometry={G.plane} position={[-DOOR.x, 2.95, -0.13]} rotation={[0, Math.PI, 0]} scale={[2.2, 0.55, 1]} material={mat('#ffffff', { map: signTexture(lit), e: lit ? '#ffffff' : '#000000', ei: lit ? 0.3 : 0 })} />
</group>

const frontLowExterior = <group>
  {/* floreiras e cardápio de calçada */}
  {[-7.3, -3.0, 0.2, 3.4].map((x) => <group key={x} position={[x, 0, -0.45]}>
    <mesh geometry={roundedBox(1.6, 0.5, 0.4, 0.04)} material={mat('#8b5a35', { r: 0.7 })} position={[0, 0.25, 0]} castShadow />
    {[-0.5, -0.17, 0.17, 0.5].map((dx, i) => <mesh key={i} geometry={G.sphereLo} material={mat(i % 2 ? '#e2476b' : '#5daa5f')} scale={[0.17, 0.15, 0.15]} position={[dx, 0.58, 0]} />)}
  </group>)}
  <group position={[-4.1, 0, -0.7]} rotation={[0, Math.PI, 0]}>
    <mesh geometry={G.box} material={mat('#5a3d2a')} scale={[0.6, 0.85, 0.04]} position={[0, 0.45, 0.12]} rotation={[-0.2, 0, 0]} />
    <mesh geometry={G.plane} material={mat('#ffffff', { map: menuBoard() })} scale={[0.52, 0.42, 1]} position={[0, 0.55, 0.16]} rotation={[-0.2, 0, 0]} />
  </group>
</group>

// Portas de vidro da entrada
function Door() {
  return <group position={[DOOR.x, 0.08, ROOM.maxZ]}>
    <mesh geometry={G.box} material={mat('#2f3b52', { r: 0.4, m: 0.3 })} scale={[DOOR.width + 0.2, 0.12, 0.3]} position={[0, 2.3, 0]} />
    {[-1, 1].map((s) => <group key={s} position={[s * (DOOR.width / 2 + 0.02), 0, 0]} rotation={[0, s * 1.25, 0]}>
      <mesh geometry={G.box} material={mat('#bfe3f2', { op: 0.35, r: 0.05 })} scale={[0.04, 2.1, 0.75]} position={[0, 1.08, s * -0.4]} />
      <mesh geometry={G.box} material={mat('#2f3b52', { r: 0.4 })} scale={[0.06, 2.15, 0.06]} position={[0, 1.08, s * -0.78]} />
    </group>)}
    <mesh geometry={G.plane} position={[0, 2.62, 0.2]} scale={[1.2, 0.3, 1]} material={mat('#ffffff', { basic: true, map: labelTexture('ABERTO', { bg: '#2f9e5b', size: 66 }) })} />
  </group>
}

// Lote ao lado: vazio (cercado) ou varanda construída
function SideLot({ terrace }) {
  const cx = (TERRACE.minX + TERRACE.maxX) / 2, cz = (TERRACE.minZ + TERRACE.maxZ) / 2
  const w = TERRACE.maxX - TERRACE.minX, d = TERRACE.maxZ - TERRACE.minZ
  if (!terrace) return <group>
    <mesh geometry={G.box} material={mat('#9cc58a', { r: 1 })} position={[cx, 0.03, cz]} scale={[w, 0.06, d]} receiveShadow />
    {Array.from({ length: 13 }, (_, i) => <mesh key={i} geometry={G.box} material={mat('#e8dcc6')} scale={[0.08, 0.7, 0.08]} position={[TERRACE.minX + i * (w / 12), 0.35, TERRACE.maxZ]} />)}
    <mesh geometry={G.box} material={mat('#e8dcc6')} scale={[w, 0.06, 0.05]} position={[cx, 0.6, TERRACE.maxZ]} />
    <mesh geometry={G.box} material={mat('#e8dcc6')} scale={[w, 0.06, 0.05]} position={[cx, 0.3, TERRACE.maxZ]} />
    <group position={[cx, 0, cz + 1]}>
      <mesh geometry={G.box} material={mat('#8a5a3a')} scale={[0.08, 1.4, 0.08]} position={[0, 0.7, 0]} />
      <mesh geometry={roundedBox(2.4, 0.7, 0.06, 0.03)} material={mat('#f4efe6')} position={[0, 1.5, 0]} />
      <mesh geometry={G.plane} position={[0, 1.5, 0.035]} scale={[2.2, 0.5, 1]} material={mat('#ffffff', { basic: true, map: labelTexture('EXPANSÃO', { bg: '#2f9e5b', size: 64 }) })} />
    </group>
    <group position={[cx - 2, 0.06, cz - 2]}><Plant kind={1} scale={1.4} pot="#9cc58a" /></group>
  </group>
  return <group>
    <mesh geometry={G.box} material={mat('#ffffff', { map: deck([w / 1.6, d / 1.6]), r: 0.75 })} position={[cx, 0.07, cz]} scale={[w, 0.14, d]} receiveShadow castShadow />
    {/* guarda-corpo */}
    {[[cx, TERRACE.minZ, w, 0], [TERRACE.maxX, cz, d, Math.PI / 2]].map(([x, z, len, r], i) => <group key={i} position={[x, 0.14, z]} rotation={[0, r, 0]}>
      <mesh geometry={G.box} material={mat('#8b5a35')} scale={[len, 0.07, 0.08]} position={[0, 0.85, 0]} />
      {Array.from({ length: Math.round(len / 0.6) + 1 }, (_, k) => <mesh key={k} geometry={G.box} material={mat('#8b5a35')} scale={[0.06, 0.85, 0.06]} position={[-len / 2 + k * (len / Math.round(len / 0.6)), 0.42, 0]} />)}
    </group>)}
    {[[TERRACE.maxX - 0.4, TERRACE.minZ + 0.4], [TERRACE.maxX - 0.4, TERRACE.maxZ - 0.5], [TERRACE.minX + 0.4, TERRACE.minZ + 0.4]].map(([x, z], i) => <group key={i} position={[x, 0.14, z]}><Plant kind={i % 2} /></group>)}
    {/* cordão de luzes */}
    {Array.from({ length: 14 }, (_, i) => <mesh key={i} geometry={G.sphereLo} material={mat('#fff1b0', { e: '#ffd24a', ei: 2 })} scale={0.05} position={[TERRACE.minX + 0.3 + i * 0.42, 2.6 - Math.sin((i / 13) * Math.PI) * 0.35, TERRACE.minZ + 0.1]} />)}
  </group>
}

export const Restaurant = memo(function Restaurant() {
  const owned = useGame((s) => s.owned)
  const expansions = useGame((s) => s.expansions)
  const tables = useGame((s) => s.tables)
  const ovenLevel = useGame((s) => s.ovenLevel)
  const theme = useGame((s) => s.theme)
  const wallColor = themeColor('wall', theme.wall)
  const floorColor = themeColor('floor', theme.floor)
  const cloth = themeColor('cloth', theme.cloth)
  const lit = !!owned.sign

  const snap = useWorldSnapshot(() => {
    const fire = [0, 0, 0], ovenPizzas = [[null, null], [null, null], [null, null]]
    world.ovens.forEach((s) => {
      fire[s.ovenIndex] = Math.max(fire[s.ovenIndex], Math.round(s.fire * 4) / 4)
      const o = s.order && world.orders.get(s.order)
      ovenPizzas[s.ovenIndex][s.i % 2] = o ? o.recipe : null
    })
    return {
      fire, ovenPizzas,
      prep: world.prep.map((p) => !!p.user && !!p.order),
      pickup: world.pickup.map((p) => { const o = p.order && world.orders.get(p.order); return o ? (o.delivery ? 'box' : o.recipe) : null }),
      seats: world.seats.map((s) => ({ food: s.food, dirty: s.dirty })),
    }
  }, 6)

  const doorOpening = { x: -DOOR.x, w: DOOR.width, bottom: 0, top: 2.3 }
  return <group>
    <Floors floorColor={floorColor} />
    {/* Parede do fundo (cozinha) */}
    <Wall position={[0, 0.08, ROOM.minZ]} rotation={0} length={W + ROOM.wallT} wallColor={wallColor}>{backWallDecor(owned, lit)}</Wall>
    {/* Parede esquerda (salão, com janelas) */}
    <Wall position={[ROOM.minX, 0.08, 0]} rotation={Math.PI / 2} length={D} wallColor={wallColor}
      openings={[{ x: -0.9, w: 1.7, bottom: 1.15, top: 2.45, window: true }, { x: -3.9, w: 1.7, bottom: 1.15, top: 2.45, window: true }]}>{leftWallDecor(owned)}</Wall>
    {/* Parede direita */}
    <Wall position={[ROOM.maxX, 0.08, 0]} rotation={-Math.PI / 2} length={D} wallColor={wallColor}
      openings={[{ x: -2.4, w: 2.0, bottom: 1.15, top: 2.45, window: true }]} />
    {/* Fachada (frente, com porta e vitrines) */}
    <Wall position={[0, 0.08, ROOM.maxZ]} rotation={Math.PI} length={W + ROOM.wallT} wallColor={wallColor} facade="#c2553f"
      openings={[doorOpening, { x: -1.6, w: 3.2, bottom: 1.0, top: 2.4, window: true }, { x: 2.2, w: 3.2, bottom: 1.0, top: 2.4, window: true }, { x: 5.6, w: 1.8, bottom: 1.0, top: 2.4, window: true }]}
      lowChildren={frontLowExterior}>{frontExterior(lit, cloth)}</Wall>
    <Door />
    <Kitchen owned={owned} expansions={expansions} ovenLevel={ovenLevel} snap={snap} />
    <Counter owned={owned} snap={snap} cloth={cloth} />
    <Dining tables={tables} owned={owned} cloth={cloth} terrace={!!expansions.terrace} snap={snap} />
    <Decor owned={owned} wallColor={wallColor} />
    <SideLot terrace={!!expansions.terrace} />
  </group>
})
