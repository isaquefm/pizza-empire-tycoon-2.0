// Textos flutuantes (+R$, reputação) em um pool fixo de sprites.
import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '../../systems/world'
import { popupTexture } from '../textures'

const POOL = 10

export function Popups() {
  const sprites = useRef([])
  const mats = useMemo(() => Array.from({ length: POOL }, () => new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false })), [])
  const ids = useRef(new Array(POOL).fill(null))
  React.useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useFrame(() => {
    const list = world.popups.slice(-POOL)
    for (let i = 0; i < POOL; i++) {
      const s = sprites.current[i]
      if (!s) continue
      const p = list[i]
      if (!p) { s.visible = false; continue }
      if (ids.current[i] !== p.id) { ids.current[i] = p.id; mats[i].map = popupTexture(p.text, p.color); mats[i].needsUpdate = true }
      s.visible = true
      const k = p.t / 2.2
      s.position.set(p.x, 2.3 + k * 1.2, p.z)
      mats[i].opacity = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25
      const sc = 0.9 + Math.min(1, p.t * 6) * 0.3
      s.scale.set(1.8 * sc, 0.45 * sc, 1)
    }
  })
  return <group>{mats.map((m, i) => <sprite key={i} ref={(r) => { sprites.current[i] = r }} material={m} visible={false} renderOrder={20} />)}</group>
}
