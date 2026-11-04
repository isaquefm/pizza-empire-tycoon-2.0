// Iluminação: sol com sombras suaves, céu/hemisfério, ambiente PBR
// procedural (RoomEnvironment) e luzes internas aconchegantes.
// Varia de acordo com o horário do jogo (manhã → tarde → noite).
import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useGame } from '../../systems/store'

const SHADOW_SIZE = { alta: 2048, media: 1024, baixa: 0 }

const KEYS = [
  // hora, cor do sol, intensidade, céu, hemisfério, interior
  [6, '#ffb98a', 0.9, '#f3c9a6', 0.55, 1.2],
  [9, '#fff0d8', 2.3, '#bfe0f0', 0.85, 0.7],
  [13, '#ffffff', 2.7, '#aed8f0', 0.95, 0.6],
  [17, '#ffd7a0', 2.1, '#c9d9e8', 0.8, 0.8],
  [19, '#ff9a6a', 1.1, '#f0a98a', 0.55, 1.4],
  [21, '#8fa6ff', 0.35, '#4a5a86', 0.32, 2.0],
  [24, '#7f95e8', 0.25, '#2f3a5c', 0.25, 2.1],
]
const ca = new THREE.Color(), cb = new THREE.Color()
function sample(hour) {
  let i = 0
  while (i < KEYS.length - 2 && hour > KEYS[i + 1][0]) i++
  const a = KEYS[i], b = KEYS[i + 1]
  const t = Math.max(0, Math.min(1, (hour - a[0]) / (b[0] - a[0])))
  return {
    sun: ca.set(a[1]).lerp(cb.set(b[1]), t).clone(),
    sunI: a[2] + (b[2] - a[2]) * t,
    sky: ca.set(a[3]).lerp(cb.set(b[3]), t).clone(),
    hemi: a[4] + (b[4] - a[4]) * t,
    inside: a[5] + (b[5] - a[5]) * t,
  }
}

export function Lighting() {
  const quality = useGame((s) => s.settings.quality)
  const sun = useRef(), hemi = useRef(), amb = useRef()
  const interior = useRef([])
  const { scene, gl } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.32
    scene.fog = new THREE.Fog('#bfe0f0', 55, 110)
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); scene.fog = null }
  }, [scene, gl])

  useEffect(() => {
    const s = sun.current
    if (!s) return
    s.target.position.set(1, 0, 0)
    s.target.updateMatrixWorld()
    const size = SHADOW_SIZE[quality]
    s.castShadow = size > 0
    if (size) {
      s.shadow.mapSize.set(size, size)
      s.shadow.map?.dispose(); s.shadow.map = null
      Object.assign(s.shadow.camera, { left: -24, right: 24, top: 20, bottom: -20, near: 1, far: 80 })
      s.shadow.camera.updateProjectionMatrix()
      s.shadow.bias = -0.0005
      s.shadow.normalBias = 0.03
      s.shadow.radius = 4
    }
  }, [quality])

  useFrame(() => {
    const clock = useGame.getState().clock
    const hour = (clock / 60) % 24
    const L = sample(hour)
    const s = sun.current
    if (s) {
      // arco do sol de leste a oeste
      const t = Math.max(0, Math.min(1, (hour - 6) / 15))
      const ang = -0.9 + t * 1.8
      s.position.set(1 + Math.sin(ang) * 22, 26 - Math.abs(ang) * 6, 14 + Math.cos(ang) * 4)
      s.color.copy(L.sun)
      s.intensity = L.sunI
    }
    if (hemi.current) hemi.current.intensity = L.hemi
    if (amb.current) amb.current.intensity = 0.12 + L.inside * 0.04
    scene.background?.isColor ? scene.background.copy(L.sky) : (scene.background = L.sky.clone())
    if (scene.fog) scene.fog.color.copy(L.sky)
    interior.current.forEach((l) => { if (l) l.intensity = l.userData.base * L.inside })
  })

  const lamp = (i, pos, base, color = '#ffd9a0', dist = 10) => <pointLight key={i} ref={(r) => { if (r) { r.userData.base = base; interior.current[i] = r } }} position={pos} color={color} distance={dist} decay={1.6} intensity={base} />
  return <group>
    <hemisphereLight ref={hemi} args={['#e4f1ff', '#b49a78', 0.9]} />
    <ambientLight ref={amb} intensity={0.15} />
    <directionalLight ref={sun} position={[12, 26, 16]} intensity={2.5} castShadow />
    {lamp(0, [-4, 2.9, 1.8], 7)}
    {lamp(1, [2, 2.9, 2.6], 7)}
    {lamp(2, [-1, 2.8, -4], 6, '#fff0d8')}
    {lamp(3, [3, 1.4, -4.4], 3.5, '#ff9a4a', 4)}
    {lamp(4, [11.8, 2.6, 0], 5, '#ffd9a0', 9)}
  </group>
}
