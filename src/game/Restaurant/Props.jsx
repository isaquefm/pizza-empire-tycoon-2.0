// Objetos 3D reutilizáveis do restaurante, modelados proceduralmente.
import React, { memo } from 'react'
import * as THREE from 'three'
import { mat, G, roundedBox } from '../materials'
import { recipeById } from '../../data/recipes'
import { gingham } from '../textures'

const TOP = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * Math.PI * 2 + 0.4, r = i === 6 ? 0 : 0.55
  return [Math.cos(a) * r, Math.sin(a) * r]
})

// Pizza com borda, molho, queijo e coberturas
export const PizzaModel = memo(function PizzaModel({ recipe = 'margherita', raw = false, eaten = false }) {
  const r = recipeById(recipe)
  if (eaten) return <group>
    <mesh geometry={G.cyl} material={mat('#f7f7f4', { r: 0.3 })} scale={[0.27, 0.02, 0.27]} />
    <mesh geometry={G.cyl} material={mat('#d9a450')} scale={[0.07, 0.025, 0.04]} position={[0.08, 0.02, 0.05]} rotation={[0, 0.6, 0]} />
  </group>
  return <group>
    <mesh geometry={G.cyl} material={mat(raw ? '#f1dcb0' : '#d99b4a', { r: 0.85 })} scale={[0.25, 0.04, 0.25]} castShadow />
    <mesh geometry={G.cyl} material={mat(raw ? '#e45b3d' : r.color, { r: 0.6 })} scale={[0.215, 0.045, 0.215]} position={[0, 0.006, 0]} />
    {!raw && <mesh geometry={G.cyl} material={mat('#f6d777', { r: 0.5 })} scale={[0.19, 0.046, 0.19]} position={[0, 0.01, 0]} />}
    {TOP.map(([x, z], i) => <mesh key={i} geometry={G.cylLo} material={mat(r.toppings[i % r.toppings.length], { r: 0.6 })} scale={[0.035, 0.05, 0.035]} position={[x * 0.25, 0.016, z * 0.25]} />)}
  </group>
})

export const PizzaBox = memo(function PizzaBox() {
  return <group>
    <mesh geometry={roundedBox(0.36, 0.07, 0.36, 0.01, 1)} material={mat('#e7c58f', { r: 0.9 })} castShadow />
    <mesh geometry={G.circle} material={mat('#d8453a')} scale={0.09} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.037, 0]} />
  </group>
})

// Mesa bistrô para 2 com toalha xadrez
export const DiningTable = memo(function DiningTable({ cloth = '#d8453a', upgraded, terrace }) {
  const wood = mat('#8b5a35', { r: 0.6 })
  return <group>
    <mesh geometry={roundedBox(0.92, 0.06, 0.82, 0.025)} material={terrace ? mat('#f0e6d4', { r: 0.6 }) : wood} position={[0, 0.62, 0]} castShadow receiveShadow />
    {!terrace && <mesh geometry={G.box} material={mat('#ffffff', { map: gingham(cloth), r: 0.9 })} scale={[0.94, 0.012, 0.84]} position={[0, 0.656, 0]} />}
    <mesh geometry={G.cylLo} material={mat('#3a3f4a', { r: 0.4, m: 0.6 })} scale={[0.05, 0.6, 0.05]} position={[0, 0.31, 0]} />
    <mesh geometry={G.cyl} material={mat('#3a3f4a', { r: 0.4, m: 0.6 })} scale={[0.26, 0.03, 0.26]} position={[0, 0.015, 0]} />
    {/* Centro de mesa: vaso e temperos */}
    <mesh geometry={G.cyl} material={mat('#eef4f6', { r: 0.1, op: 0.75 })} scale={[0.035, 0.12, 0.035]} position={[0, 0.72, -0.25]} />
    <mesh geometry={G.sphereLo} material={mat(upgraded ? '#f2c14e' : '#e2476b')} scale={0.04} position={[0, 0.8, -0.25]} />
    <mesh geometry={G.cyl} material={mat('#f7f2e8')} scale={[0.02, 0.07, 0.02]} position={[0.06, 0.7, -0.27]} />
    <mesh geometry={G.cyl} material={mat('#3b3b3b')} scale={[0.02, 0.07, 0.02]} position={[-0.06, 0.7, -0.27]} />
  </group>
})

// Cadeira (madeira ou estofada). rot = direção para onde a pessoa olha
export const Chair = memo(function Chair({ padded, color = '#c0453b' }) {
  const wood = mat('#9a6238', { r: 0.6 })
  const seat = padded ? mat(color, { r: 0.85 }) : wood
  return <group>
    <mesh geometry={roundedBox(0.44, padded ? 0.09 : 0.05, 0.42, padded ? 0.035 : 0.015)} material={seat} position={[0, 0.42, 0]} castShadow />
    {[[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]].map(([x, z], i) => <mesh key={i} geometry={G.cylLo} material={wood} scale={[0.025, 0.42, 0.025]} position={[x, 0.2, z]} />)}
    {/* encosto (atrás = −z local) */}
    <mesh geometry={roundedBox(0.44, padded ? 0.42 : 0.32, padded ? 0.08 : 0.04, padded ? 0.035 : 0.012)} material={seat} position={[0, padded ? 0.68 : 0.7, -0.19]} rotation={[-0.08, 0, 0]} castShadow />
    {!padded && <mesh geometry={G.box} material={wood} scale={[0.04, 0.3, 0.03]} position={[0, 0.62, -0.19]} />}
  </group>
})

export const Plant = memo(function Plant({ scale = 1, pot = '#c8643f', kind = 0 }) {
  const leaf = mat(kind ? '#4f9a55' : '#5daa5f', { r: 0.7 })
  const leaf2 = mat('#3f8247', { r: 0.7 })
  return <group scale={scale}>
    <mesh geometry={G.cyl} material={mat(pot, { r: 0.7 })} scale={[0.2, 0.32, 0.2]} position={[0, 0.16, 0]} castShadow />
    <mesh geometry={G.cyl} material={mat('#5a3d2a')} scale={[0.18, 0.02, 0.18]} position={[0, 0.32, 0]} />
    {kind === 0
      ? [0, 1, 2, 3, 4, 5, 6].map((i) => { const a = i * 0.9; return <mesh key={i} geometry={G.sphereLo} material={i % 2 ? leaf : leaf2} scale={[0.1, 0.32, 0.05]} position={[Math.cos(a) * 0.1, 0.55 + (i % 3) * 0.06, Math.sin(a) * 0.1]} rotation={[Math.sin(a) * 0.5, a, Math.cos(a) * 0.5]} castShadow /> })
      : <group>{[0, 1, 2].map((i) => <mesh key={i} geometry={G.sphereLo} material={i === 1 ? leaf2 : leaf} scale={0.24 - i * 0.04} position={[0, 0.55 + i * 0.2, 0]} castShadow />)}</group>}
  </group>
})

// Forno a lenha em cúpula de tijolos
export const PizzaOven = memo(function PizzaOven({ fire = 0.5, level = 1 }) {
  const brick = mat('#b5563f', { r: 0.85 })
  return <group>
    <mesh geometry={roundedBox(1.3, 0.8, 1.15, 0.05)} material={mat('#8e9aa6', { r: 0.4, m: 0.5 })} position={[0, 0.4, 0]} castShadow receiveShadow />
    <mesh geometry={G.sphere} material={brick} scale={[0.66, 0.6, 0.58]} position={[0, 0.82, -0.02]} castShadow />
    <mesh geometry={G.cyl} material={mat('#7e3a2a', { r: 0.8 })} scale={[0.68, 0.1, 0.6]} position={[0, 0.84, -0.02]} />
    {/* boca do forno com brilho do fogo */}
    <mesh geometry={G.circle} material={mat('#1a0e0a', { e: '#ff7a2f', ei: 0.6 + fire * 1.6 })} scale={[0.26, 0.2, 1]} position={[0, 0.98, 0.555]} />
    <mesh geometry={G.torus} material={mat('#e7d3b0', { r: 0.6 })} scale={[0.28, 0.23, 0.4]} position={[0, 0.98, 0.55]} />
    <mesh geometry={G.cyl} material={mat('#5d636e', { r: 0.4, m: 0.6 })} scale={[0.1, 0.9, 0.1]} position={[0, 1.65, -0.15]} />
    <mesh geometry={roundedBox(0.3, 0.1, 0.2, 0.02)} material={mat('#f2c14e', { r: 0.4, m: 0.4 })} position={[0, 0.66, 0.59]} />
    {/* nível do forno: estrelas */}
    {Array.from({ length: Math.min(5, level) }, (_, i) => <mesh key={i} geometry={G.sphereLo} material={mat('#ffd24a', { e: '#ffb400', ei: 0.4 })} scale={0.028} position={[-0.12 + i * 0.06, 0.66, 0.7]} />)}
    {/* lenha */}
    {[0, 1, 2].map((i) => <mesh key={i} geometry={G.cylLo} material={mat('#7a4a2a')} scale={[0.05, 0.4, 0.05]} rotation={[0, 0, Math.PI / 2]} position={[0.85, 0.08 + i * 0.09, 0.1 + (i % 2) * 0.1]} />)}
  </group>
})

// Bancada inox de preparo com ingredientes
export const PrepCounter = memo(function PrepCounter({ busy }) {
  const steel = mat('#c4ccd4', { r: 0.28, m: 0.75 })
  return <group>
    <mesh geometry={roundedBox(1.4, 0.86, 0.85, 0.03)} material={mat('#9ea8b3', { r: 0.35, m: 0.6 })} position={[0, 0.43, 0]} castShadow receiveShadow />
    <mesh geometry={G.box} material={steel} scale={[1.44, 0.05, 0.88]} position={[0, 0.88, 0]} />
    <mesh geometry={G.box} material={mat('#8a929c', { r: 0.4, m: 0.6 })} scale={[1.3, 0.02, 0.02]} position={[0, 0.6, 0.43]} />
    {/* tábua com massa */}
    <mesh geometry={roundedBox(0.55, 0.04, 0.42, 0.015)} material={mat('#d8b07a', { r: 0.7 })} position={[0, 0.92, 0.08]} />
    {busy && <mesh geometry={G.cyl} material={mat('#f1dcb0', { r: 0.9 })} scale={[0.17, 0.02, 0.17]} position={[0, 0.95, 0.08]} />}
    {/* potes de ingredientes */}
    {['#e45b3d', '#f6e7b5', '#4f9a45', '#b8433b', '#2c2c2c'].map((c, i) => <group key={i} position={[-0.5 + i * 0.25, 0.93, -0.28]}>
      <mesh geometry={G.cyl} material={steel} scale={[0.09, 0.08, 0.09]} />
      <mesh geometry={G.cyl} material={mat(c, { r: 0.7 })} scale={[0.08, 0.02, 0.08]} position={[0, 0.035, 0]} />
    </group>)}
    <mesh geometry={G.cylLo} material={mat('#8a5a3a')} scale={[0.025, 0.4, 0.025]} rotation={[0, 0, Math.PI / 2]} position={[0.45, 0.93, 0.15]} />
  </group>
})

export const Fridge = memo(function Fridge({ glass }) {
  return <group>
    <mesh geometry={roundedBox(0.95, 2.1, 0.75, 0.05)} material={mat('#dfe5ea', { r: 0.25, m: 0.55 })} position={[0, 1.05, 0]} castShadow />
    <mesh geometry={G.box} material={glass ? mat('#a9d4e6', { r: 0.05, op: 0.55 }) : mat('#cfd6dc', { r: 0.3, m: 0.5 })} scale={[0.82, 1.2, 0.02]} position={[0, 1.3, 0.38]} />
    <mesh geometry={G.box} material={mat('#cfd6dc', { r: 0.3, m: 0.5 })} scale={[0.82, 0.62, 0.02]} position={[0, 0.38, 0.38]} />
    <mesh geometry={G.box} material={mat('#6c7480', { m: 0.8, r: 0.2 })} scale={[0.04, 0.5, 0.05]} position={[0.34, 1.25, 0.41]} />
    <mesh geometry={G.box} material={mat('#6c7480', { m: 0.8, r: 0.2 })} scale={[0.04, 0.3, 0.05]} position={[0.34, 0.45, 0.41]} />
    {glass && [0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <mesh key={`${r}${c}`} geometry={G.cyl} material={mat(['#e45b3d', '#4c8fd6', '#7cbf6b', '#f2c14e'][(r + c) % 4], { r: 0.3 })} scale={[0.05, 0.22, 0.05]} position={[-0.27 + c * 0.18, 0.9 + r * 0.38, 0.2]} />))}
  </group>
})

export const Shelf = memo(function Shelf({ full = true, width = 1.4 }) {
  const wood = mat('#8b5a35', { r: 0.6 })
  const items = ['#e45b3d', '#f2c14e', '#4f9a45', '#f6efe0', '#b8433b', '#d9a450']
  return <group>
    {[0.9, 1.45, 2.0].map((y, r) => <group key={y}>
      <mesh geometry={G.box} material={wood} scale={[width, 0.05, 0.38]} position={[0, y, 0]} castShadow />
      {full && Array.from({ length: Math.floor(width / 0.22) }, (_, i) => {
        const c = items[(i + r * 2) % items.length]
        const tall = (i + r) % 3 === 0
        return tall
          ? <mesh key={i} geometry={G.cyl} material={mat(c, { r: 0.4 })} scale={[0.07, 0.3, 0.07]} position={[-width / 2 + 0.15 + i * 0.22, y + 0.17, 0]} />
          : <group key={i} position={[-width / 2 + 0.15 + i * 0.22, y + 0.1, 0]}>
            <mesh geometry={G.cyl} material={mat('#eef3f5', { r: 0.1, op: 0.7 })} scale={[0.08, 0.16, 0.08]} />
            <mesh geometry={G.cyl} material={mat(c)} scale={[0.07, 0.1, 0.07]} position={[0, -0.02, 0]} />
            <mesh geometry={G.cyl} material={mat('#c8423a')} scale={[0.085, 0.025, 0.085]} position={[0, 0.09, 0]} />
          </group>
      })}
    </group>)}
    {[-1, 1].map((s) => <mesh key={s} geometry={G.box} material={wood} scale={[0.05, 1.3, 0.38]} position={[s * width / 2, 1.45, 0]} />)}
  </group>
})

export const PendantLamp = memo(function PendantLamp({ on = true, color = '#2f3b52', drop = 1.0 }) {
  return <group>
    <mesh geometry={G.cylLo} material={mat('#2a2a2e')} scale={[0.006, drop, 0.006]} position={[0, -drop / 2, 0]} />
    <mesh geometry={G.cone} material={mat(color, { r: 0.4, m: 0.3, side: THREE.DoubleSide })} scale={[0.22, 0.2, 0.22]} position={[0, -drop - 0.05, 0]} />
    <mesh geometry={G.sphereLo} material={mat('#fff3c4', { e: '#ffd88a', ei: on ? 2.2 : 0.2 })} scale={0.07} position={[0, -drop - 0.15, 0]} />
  </group>
})

export const WallFrame = memo(function WallFrame({ map, w = 0.9, h = 0.7, frame = '#6b4a2f' }) {
  return <group>
    <mesh geometry={roundedBox(w + 0.1, h + 0.1, 0.05, 0.015)} material={mat(frame, { r: 0.5 })} />
    <mesh geometry={G.plane} material={mat('#ffffff', { map, r: 0.8 })} scale={[w, h, 1]} position={[0, 0, 0.027]} />
  </group>
})

export const StreetLamp = memo(function StreetLamp({ on }) {
  return <group>
    <mesh geometry={G.cyl} material={mat('#2f3b52', { r: 0.4, m: 0.5 })} scale={[0.07, 3.2, 0.07]} position={[0, 1.6, 0]} castShadow />
    <mesh geometry={G.cyl} material={mat('#2f3b52', { r: 0.4, m: 0.5 })} scale={[0.14, 0.2, 0.14]} position={[0, 0.1, 0]} />
    <mesh geometry={G.box} material={mat('#2f3b52')} scale={[0.04, 0.04, 0.6]} position={[0, 3.15, 0.28]} />
    <mesh geometry={G.cone} material={mat('#2f3b52', { r: 0.4, m: 0.5 })} scale={[0.22, 0.18, 0.22]} position={[0, 3.12, 0.55]} />
    <mesh geometry={G.sphereLo} material={mat('#fff6d8', { e: '#ffe2a0', ei: on ? 3 : 0.1 })} scale={[0.12, 0.06, 0.12]} position={[0, 3.03, 0.55]} />
  </group>
})

export const Tree = memo(function Tree({ scale = 1, tone = 0 }) {
  const cols = [['#6aa95f', '#7dbb6c', '#5a9a52'], ['#7fae5a', '#93c06a', '#6b9c4c'], ['#5e9e6e', '#74b47f', '#4e8c5f']][tone % 3]
  return <group scale={scale}>
    <mesh geometry={G.cylLo} material={mat('#7a5236', { r: 0.9 })} scale={[0.11, 1.3, 0.11]} position={[0, 0.65, 0]} castShadow />
    {[[0, 1.6, 0, 0.62], [0.32, 1.35, 0.1, 0.45], [-0.3, 1.4, -0.08, 0.48], [0.05, 2.0, -0.05, 0.45], [-0.08, 1.5, 0.3, 0.4]].map(([x, y, z, r], i) =>
      <mesh key={i} geometry={G.sphereLo} material={mat(cols[i % 3], { r: 0.8 })} scale={r} position={[x, y, z]} castShadow />)}
    <mesh geometry={G.cyl} material={mat('#6b4a2f', { r: 0.9 })} scale={[0.4, 0.05, 0.4]} position={[0, 0.02, 0]} />
  </group>
})

export const Bench = memo(function Bench() {
  const wood = mat('#a8703f', { r: 0.6 })
  const iron = mat('#2f3b52', { r: 0.4, m: 0.5 })
  return <group>
    {[0, 1, 2].map((i) => <mesh key={i} geometry={G.box} material={wood} scale={[1.5, 0.04, 0.1]} position={[0, 0.45, -0.13 + i * 0.13]} castShadow />)}
    {[0, 1].map((i) => <mesh key={i} geometry={G.box} material={wood} scale={[1.5, 0.1, 0.04]} position={[0, 0.65 + i * 0.13, -0.22]} />)}
    {[-0.65, 0.65].map((x) => <mesh key={x} geometry={G.box} material={iron} scale={[0.05, 0.45, 0.4]} position={[x, 0.22, -0.03]} />)}
  </group>
})

export const Car = memo(function Car({ color = '#e45d50', kind = 0 }) {
  const body = mat(color, { r: 0.25, m: 0.3 })
  const glass = mat('#8fb6cf', { r: 0.05, m: 0.4 })
  const tire = mat('#202226', { r: 0.8 })
  const L = kind === 1 ? 2.6 : 2.2
  return <group>
    <mesh geometry={roundedBox(L, 0.5, 1.15, 0.16)} material={body} position={[0, 0.42, 0]} castShadow />
    <mesh geometry={roundedBox(L * (kind === 1 ? 0.7 : 0.55), 0.45, 1.0, 0.15)} material={body} position={[kind === 1 ? -0.15 : -0.1, 0.82, 0]} castShadow />
    <mesh geometry={roundedBox(L * (kind === 1 ? 0.66 : 0.5), 0.34, 1.03, 0.1)} material={glass} position={[kind === 1 ? -0.15 : -0.1, 0.84, 0]} />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <mesh key={i} geometry={G.cyl} material={tire} scale={[0.22, 0.16, 0.22]} rotation={[Math.PI / 2, 0, 0]} position={[a * L * 0.32, 0.22, b * 0.52]} />)}
    <mesh geometry={G.box} material={mat('#fff6d8', { e: '#fff1b0', ei: 0.6 })} scale={[0.04, 0.1, 0.22]} position={[L / 2, 0.48, 0.35]} />
    <mesh geometry={G.box} material={mat('#fff6d8', { e: '#fff1b0', ei: 0.6 })} scale={[0.04, 0.1, 0.22]} position={[L / 2, 0.48, -0.35]} />
    <mesh geometry={G.box} material={mat('#c8303a', { e: '#c8303a', ei: 0.3 })} scale={[0.04, 0.08, 0.2]} position={[-L / 2, 0.5, 0.38]} />
    <mesh geometry={G.box} material={mat('#c8303a', { e: '#c8303a', ei: 0.3 })} scale={[0.04, 0.08, 0.2]} position={[-L / 2, 0.5, -0.38]} />
  </group>
})

export const Scooter = memo(function Scooter() {
  const red = mat('#d8453a', { r: 0.3, m: 0.2 })
  const dark = mat('#2a2d36', { r: 0.6 })
  return <group>
    {[-0.45, 0.45].map((x) => <mesh key={x} geometry={G.torus} material={dark} scale={[0.2, 0.2, 0.5]} position={[x, 0.2, 0]} />)}
    <mesh geometry={roundedBox(0.9, 0.18, 0.32, 0.07)} material={red} position={[0, 0.36, 0]} castShadow />
    <mesh geometry={roundedBox(0.4, 0.12, 0.3, 0.05)} material={dark} position={[-0.15, 0.5, 0]} />
    <mesh geometry={G.cylLo} material={dark} scale={[0.03, 0.55, 0.03]} position={[0.42, 0.62, 0]} rotation={[0, 0, -0.3]} />
    <mesh geometry={G.box} material={dark} scale={[0.04, 0.04, 0.5]} position={[0.5, 0.88, 0]} />
    <mesh geometry={roundedBox(0.42, 0.36, 0.38, 0.04)} material={red} position={[-0.38, 0.72, 0]} castShadow />
    <mesh geometry={G.box} material={mat('#f2c14e')} scale={[0.43, 0.05, 0.39]} position={[-0.38, 0.8, 0]} />
  </group>
})
