// Canvas 3D principal: simulação, câmera, luz, cidade, restaurante e personagens.
import React, { Component, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../systems/store'
import { stepSimulation } from '../systems/simulation'
import { CameraRig } from './Camera/CameraRig'
import { Lighting } from './Lighting/Lighting'
import { City } from './World/City'
import { DeliveryScooters } from './World/DeliveryScooters'
import { Restaurant } from './Restaurant/Restaurant'
import { Characters } from '../characters/Characters'
import { Popups } from './Effects/Popups'
import { disposeAll } from './materials'
import { disposeTextures } from './textures'

const DPR = { alta: [1, 2], media: [1, 1.5], baixa: [0.8, 1] }

function GameLoop() {
  useFrame((_, dt) => {
    try { stepSimulation(dt) } catch (err) { console.error('Erro na simulação:', err) }
  })
  return null
}

function Scene() {
  const hour = useGame((s) => Math.floor(s.clock / 60))
  const lampsOn = hour >= 18 || hour < 7
  const deselect = (e) => { if (e.delta <= 6) useGame.getState().select(null) }
  return <group onClick={deselect}>
    <City lampsOn={lampsOn} />
    <Restaurant />
    <DeliveryScooters />
  </group>
}

class CanvasBoundary extends Component {
  constructor(p) { super(p); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error('Falha ao renderizar o cenário 3D:', error) }
  render() {
    if (this.state.error) return <div className="webgl-error"><b>Não foi possível iniciar o cenário 3D.</b><p>Verifique se o navegador tem WebGL habilitado e a aceleração de hardware ativa. Tente recarregar a página ou reduzir a qualidade gráfica.</p><button onClick={() => this.setState({ error: null })}>Tentar novamente</button></div>
    return this.props.children
  }
}

export function GameCanvas() {
  const quality = useGame((s) => s.settings.quality)
  useEffect(() => () => { disposeAll(); disposeTextures() }, [])
  return <CanvasBoundary>
    <Canvas
      shadows={quality !== 'baixa'}
      dpr={DPR[quality]}
      camera={{ fov: 30, near: 0.5, far: 220, position: [20, 22, 20] }}
      gl={{ antialias: quality !== 'baixa', powerPreference: 'high-performance', preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
    >
      <GameLoop />
      <CameraRig />
      <Lighting />
      <Suspense fallback={null}>
        <Scene />
        <Characters />
        <Popups />
      </Suspense>
    </Canvas>
  </CanvasBoundary>
}
