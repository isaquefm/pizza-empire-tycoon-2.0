// Paredes com aberturas (portas/janelas) e corte automático: a parede que
// fica entre a câmera e o interior abaixa suavemente para não esconder nada.
import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat, G } from '../materials'
import { plaster, brick } from '../textures'
import { ROOM } from '../../data/layout'

const LOW = 1.0
const tmp = new THREE.Vector3()

// Gera os blocos sólidos de um trecho de parede com aberturas
function solids(length, h0, h1, openings) {
  const out = []
  const ops = openings.filter((o) => o.bottom < h1 && o.top > h0).sort((a, b) => a.x - b.x)
  let cursor = -length / 2
  for (const o of ops) {
    const a = o.x - o.w / 2, b = o.x + o.w / 2
    if (a > cursor) out.push({ x: (cursor + a) / 2, w: a - cursor, y0: h0, y1: h1 })
    if (o.bottom > h0) out.push({ x: o.x, w: o.w, y0: h0, y1: Math.min(o.bottom, h1) })
    if (o.top < h1) out.push({ x: o.x, w: o.w, y0: Math.max(o.top, h0), y1: h1 })
    cursor = b
  }
  if (cursor < length / 2) out.push({ x: (cursor + length / 2) / 2, w: length / 2 - cursor, y0: h0, y1: h1 })
  return out
}

function Block({ b, inner, outer, trim, t }) {
  const h = b.y1 - b.y0
  // Faces: +x, −x, +y, −y, +z (interno), −z (externo)
  const mats = useMemo(() => [trim, trim, trim, trim, inner, outer], [inner, outer, trim])
  return <mesh geometry={G.box} material={mats} position={[b.x, b.y0 + h / 2, 0]} scale={[b.w, h, t]} castShadow receiveShadow />
}

export function Wall({ position, rotation = 0, length, openings = [], wallColor, children, lowChildren, exterior, facade = '#b5563f', height = ROOM.wallH }) {
  const upper = useRef()
  const group = useRef()
  const t = ROOM.wallT
  const inner = mat('#ffffff', { map: plaster(wallColor, [length / 3, 1]), r: 0.9 })
  const wains = mat('#7a5236', { r: 0.6 })
  const outer = mat('#ffffff', { map: brick(facade, [length / 2.2, 1.5]), r: 0.9 })
  const trim = mat('#efe6d8', { r: 0.7 })
  const lower = solids(length, 0, LOW, openings)
  const up = solids(length, LOW, height, openings)
  const normal = useMemo(() => new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation), [rotation])
  const center = useMemo(() => new THREE.Vector3(...position), [position])
  const state = useRef({ s: 1 })

  useFrame(({ camera }, dt) => {
    tmp.copy(camera.position).sub(center)
    tmp.y = 0
    const cut = tmp.normalize().dot(normal) > 0.15
    const target = cut ? 0.02 : 1
    const st = state.current
    st.s += (target - st.s) * Math.min(1, dt * 6)
    if (upper.current) {
      upper.current.scale.y = st.s
      upper.current.visible = st.s > 0.03
    }
  })

  return <group ref={group} position={position} rotation={[0, rotation, 0]}>
    {lower.map((b, i) => <Block key={`l${i}`} b={b} inner={wains} outer={outer} trim={trim} t={t} />)}
    {/* rodapé de madeira e friso */}
    {lower.map((b, i) => <mesh key={`r${i}`} geometry={G.box} material={trim} position={[b.x, LOW, t / 2 + 0.01]} scale={[b.w, 0.06, 0.05]} />)}
    {lowChildren}
    <group ref={upper} position={[0, LOW, 0]}>
      <group position={[0, -LOW, 0]}>
        {up.map((b, i) => <Block key={`u${i}`} b={b} inner={inner} outer={outer} trim={trim} t={t} />)}
        {/* cornija */}
        <mesh geometry={G.box} material={trim} position={[0, height + 0.05, 0]} scale={[length + 0.1, 0.12, t + 0.12]} castShadow />
        {openings.filter((o) => o.window).map((o, i) => <WindowPane key={i} o={o} t={t} />)}
        {children}
      </group>
    </group>
    {exterior}
  </group>
}

function WindowPane({ o, t }) {
  const frame = mat('#f4efe6', { r: 0.5 })
  const glass = mat('#bfe3f2', { r: 0.05, m: 0.1, op: 0.32 })
  const h = o.top - o.bottom, cy = o.bottom + h / 2
  return <group position={[o.x, cy, 0]}>
    <mesh geometry={G.box} material={glass} scale={[o.w, h, 0.03]} />
    {[[0, h / 2, o.w + 0.08, 0.08], [0, -h / 2, o.w + 0.16, 0.1], [-o.w / 2, 0, 0.08, h], [o.w / 2, 0, 0.08, h], [0, 0, 0.05, h], [0, h * 0.12, o.w, 0.05]].map(([x, y, w, hh], i) =>
      <mesh key={i} geometry={G.box} material={frame} position={[x, y, 0]} scale={[w, hh, t + 0.06]} />)}
  </group>
}
