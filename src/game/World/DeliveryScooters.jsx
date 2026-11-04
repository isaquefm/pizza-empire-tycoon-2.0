// Scooters dos entregadores: estacionadas na calçada e animadas durante
// as entregas (saem pela rua e voltam).
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { world } from '../../systems/world'
import { useGame } from '../../systems/store'
import { SCOOTER } from '../../data/layout'
import { Scooter } from '../Restaurant/Props'
import { mat, G } from '../materials'

const LANE_Z = 10.2

function Rider() {
  return <group position={[-0.05, 0.55, 0]}>
    <mesh geometry={G.sphereLo} material={mat('#e0473a', { r: 0.6 })} scale={[0.2, 0.28, 0.18]} position={[0, 0.25, 0]} />
    <mesh geometry={G.sphere} material={mat('#e0473a', { r: 0.25 })} scale={0.17} position={[0.02, 0.66, 0]} />
    <mesh geometry={G.box} material={mat('#24324a', { op: 0.6 })} scale={[0.05, 0.1, 0.24]} position={[0.16, 0.66, 0]} />
    <mesh geometry={G.box} material={mat('#d8453a')} scale={[0.26, 0.28, 0.32]} position={[-0.22, 0.32, 0]} />
    {[-1, 1].map((s) => <mesh key={s} geometry={G.cylLo} material={mat('#2a2f38')} scale={[0.05, 0.36, 0.05]} rotation={[0, 0, 1.2]} position={[0.12, 0.02, s * 0.1]} />)}
  </group>
}

function OneScooter({ index }) {
  const ref = useRef(), rider = useRef()
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const park = { x: SCOOTER.x + index * 1.25, z: SCOOTER.z }
    const courier = [...world.workers.values()].find((w) => w.role === 'courier' && w.idx === index)
    const ride = courier?.ride
    if (!ride) {
      g.position.set(park.x, 0.08, park.z); g.rotation.y = 0; rider.current.visible = false
      return
    }
    const p = ride.t / ride.dur
    rider.current.visible = true
    if (p < 0.12) { // sai da vaga para a rua
      const k = p / 0.12
      g.position.set(park.x + k * 2, 0.04, park.z + (LANE_Z - park.z) * k); g.rotation.y = -0.5 * (1 - k)
    } else if (p < 0.45) {
      const k = (p - 0.12) / 0.33
      g.position.set(park.x + 2 + k * 45, 0.04, LANE_Z); g.rotation.y = 0
    } else if (p < 0.55) {
      g.position.set(80, 0, LANE_Z)
    } else if (p < 0.88) {
      const k = (p - 0.55) / 0.33
      g.position.set(-45 + k * (park.x - 2 + 45), 0.04, LANE_Z); g.rotation.y = 0
    } else {
      const k = (p - 0.88) / 0.12
      g.position.set(park.x - 2 + k * 2, 0.06, LANE_Z + (park.z - LANE_Z) * k); g.rotation.y = 0.5 * (1 - k)
    }
  })
  return <group ref={ref}><Scooter /><group ref={rider} visible={false}><Rider /></group></group>
}

export function DeliveryScooters() {
  const couriers = useGame((s) => s.staff.filter((m) => m.role === 'courier').length)
  return <group>{Array.from({ length: Math.min(3, couriers) }, (_, i) => <OneScooter key={i} index={i} />)}</group>
}
