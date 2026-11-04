import React from 'react'
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Crosshair, Maximize, Home } from 'lucide-react'
import { useGame } from '../../systems/store'

export function CameraControls() {
  const cam = useGame((s) => s.camera)
  const full = () => {
    const el = document.querySelector('.tycoon-app')
    if (document.fullscreenElement) document.exitFullscreen?.()
    else el?.requestFullscreen?.().catch(() => {})
  }
  return <div className="world-controls">
    <button title="Aproximar (roda do mouse / +)" onClick={() => cam('zoomIn')}><ZoomIn /></button>
    <button title="Afastar (roda do mouse / −)" onClick={() => cam('zoomOut')}><ZoomOut /></button>
    <button title="Girar à esquerda (Q)" onClick={() => cam('rotateLeft')}><RotateCcw /></button>
    <button title="Girar à direita (E)" onClick={() => cam('rotateRight')}><RotateCw /></button>
    <button title="Centralizar no restaurante" onClick={() => cam('center')}><Crosshair /></button>
    <button title="Restaurar câmera" onClick={() => cam('reset')}><Home /></button>
    <button title="Tela cheia" onClick={full}><Maximize /></button>
  </div>
}
