// Câmera isométrica interativa: arrastar (botão esquerdo) move, botão
// direito gira, roda do mouse aproxima; WASD/setas movem, Q/E giram.
// Movimento suavizado e limitado para nunca perder o restaurante de vista.
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGame } from '../../systems/store'
import { CAMERA_BOUNDS } from '../../data/layout'

const HOME = { x: 1.2, z: 0.6, yaw: Math.PI / 4, dist: 27, pitch: 0.9 }
const LIMITS = { minDist: 9, maxDist: 44, minPitch: 0.62, maxPitch: 1.22 }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export function CameraRig() {
  const { camera, gl } = useThree()
  const goal = useRef({ ...HOME })
  const cur = useRef({ ...HOME })
  const keys = useRef({})
  const drag = useRef(null)
  const focusBack = useRef(null)
  const focusTimer = useRef(null)

  useEffect(() => {
    const el = gl.domElement
    const down = (e) => {
      focusBack.current = null // o jogador assumiu a câmera
      drag.current = { x: e.clientX, y: e.clientY, button: e.button, moved: 0 }
      el.setPointerCapture?.(e.pointerId)
    }
    const move = (e) => {
      const d = drag.current
      if (!d) return
      const dx = e.clientX - d.x, dy = e.clientY - d.y
      d.x = e.clientX; d.y = e.clientY; d.moved += Math.abs(dx) + Math.abs(dy)
      const g = goal.current
      if (d.button === 2 || (d.button === 0 && e.shiftKey)) {
        g.yaw -= dx * 0.006
        g.pitch = clamp(g.pitch + dy * 0.004, LIMITS.minPitch, LIMITS.maxPitch)
      } else if (d.button === 0 || d.button === 1) {
        const k = g.dist * 0.0021
        const cos = Math.cos(g.yaw), sin = Math.sin(g.yaw)
        // direita da câmera = (cos, -sin); frente = (-sin, -cos)
        g.x -= (dx * cos + dy * sin) * k
        g.z -= (-dx * sin + dy * cos) * k
      }
    }
    const up = (e) => { drag.current = null; el.releasePointerCapture?.(e.pointerId) }
    const wheel = (e) => {
      e.preventDefault()
      const g = goal.current
      g.dist = clamp(g.dist * (e.deltaY > 0 ? 1.1 : 0.9), LIMITS.minDist, LIMITS.maxDist)
    }
    const ctx = (e) => e.preventDefault()
    const typing = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)
    const kd = (e) => { if (!typing(e)) keys.current[e.key.toLowerCase()] = true }
    const ku = (e) => { keys.current[e.key.toLowerCase()] = false }
    const blur = () => { keys.current = {} }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('contextmenu', ctx)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    window.addEventListener('blur', blur)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('contextmenu', ctx)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      window.removeEventListener('blur', blur)
    }
  }, [gl])

  // Comandos dos botões da interface
  useEffect(() => useGame.subscribe((s, prev) => {
    if (!s.cameraCmd || s.cameraCmd === prev.cameraCmd) return
    const g = goal.current
    switch (s.cameraCmd.cmd) {
      case 'zoomIn': g.dist = clamp(g.dist * 0.8, LIMITS.minDist, LIMITS.maxDist); break
      case 'zoomOut': g.dist = clamp(g.dist * 1.25, LIMITS.minDist, LIMITS.maxDist); break
      case 'rotateLeft': g.yaw += Math.PI / 4; break
      case 'rotateRight': g.yaw -= Math.PI / 4; break
      case 'center': g.x = HOME.x; g.z = HOME.z; break
      case 'reset': Object.assign(g, { ...HOME, yaw: HOME.yaw + Math.round((g.yaw - HOME.yaw) / (Math.PI * 2)) * Math.PI * 2 }); break
      case 'kitchen': g.x = 0.5; g.z = -3.8; g.dist = Math.min(g.dist, 16); break
      case 'dining': g.x = -1.5; g.z = 2.4; g.dist = Math.min(g.dist, 18); break
      case 'terrace': g.x = 11.8; g.z = 0; g.dist = Math.min(g.dist, 19); break
      case 'focus': {
        // Mostra o item recém-comprado e volta sozinha, a menos que o jogador mexa na câmera
        const back = focusBack.current || { x: g.x, z: g.z, dist: g.dist }
        focusBack.current = back
        g.x = s.cameraCmd.pos[0]; g.z = s.cameraCmd.pos[1]; g.dist = Math.min(g.dist, 15)
        clearTimeout(focusTimer.current)
        focusTimer.current = setTimeout(() => {
          if (focusBack.current) Object.assign(g, focusBack.current)
          focusBack.current = null
        }, 2600)
        break
      }
      default: break
    }
  }), [])

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const g = goal.current, k = keys.current
    const pan = g.dist * 0.75 * d
    const fx = -Math.sin(g.yaw), fz = -Math.cos(g.yaw)
    const rx = Math.cos(g.yaw), rz = -Math.sin(g.yaw)
    if (k.w || k.arrowup) { g.x += fx * pan; g.z += fz * pan }
    if (k.s || k.arrowdown) { g.x -= fx * pan; g.z -= fz * pan }
    if (k.d || k.arrowright) { g.x += rx * pan; g.z += rz * pan }
    if (k.a || k.arrowleft) { g.x -= rx * pan; g.z -= rz * pan }
    if (k.q) g.yaw += d * 1.6
    if (k.e) g.yaw -= d * 1.6
    if (k['+'] || k['=']) g.dist = clamp(g.dist * (1 - d), LIMITS.minDist, LIMITS.maxDist)
    if (k['-']) g.dist = clamp(g.dist * (1 + d), LIMITS.minDist, LIMITS.maxDist)
    g.x = clamp(g.x, CAMERA_BOUNDS.minX, CAMERA_BOUNDS.maxX)
    g.z = clamp(g.z, CAMERA_BOUNDS.minZ, CAMERA_BOUNDS.maxZ)

    const c = cur.current, s = 1 - Math.exp(-d * 7)
    for (const key of ['x', 'z', 'yaw', 'dist', 'pitch']) c[key] += (g[key] - c[key]) * s
    const h = Math.sin(c.pitch) * c.dist, r = Math.cos(c.pitch) * c.dist
    camera.position.set(c.x + Math.sin(c.yaw) * r, h, c.z + Math.cos(c.yaw) * r)
    camera.lookAt(c.x, 0.6, c.z)
  })
  return null
}
