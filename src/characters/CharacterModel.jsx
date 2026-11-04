// Personagem cartoon 3D modular e articulado.
// Todas as instâncias compartilham geometrias (parts.js) e materiais (cache).
import React, { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { P, RIG } from './parts'
import { computePose, newPose, POSE_KEYS } from './animations'
import { mat } from '../game/materials'
import { bubbleTexture, blobShadow } from '../game/textures'
import { PizzaModel, PizzaBox } from '../game/Restaurant/Props'
import { useGame } from '../systems/store'
import { getEntity } from '../systems/simulation'

const R = RIG.headR
const darken = (hex, f = -0.12) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, f); return `#${c.getHexString()}` }

function Hair({ a }) {
  const hm = mat(a.hairColor, { r: 0.55 })
  const cap = (s = 1.08, tilt = -0.75, y = 0.01) => <mesh geometry={P.hairCap} material={hm} scale={[R * s, R * s, R * s]} rotation={[tilt, 0, 0]} position={[0, y, -0.005]} castShadow />
  switch (a.hairStyle) {
    case 'bald':
      return a.elder ? <mesh geometry={P.ring} material={hm} scale={[R * 0.98, R * 0.98, R * 1.6]} rotation={[Math.PI / 2 - 0.25, 0, 0]} position={[0, -0.02, -0.03]} /> : null
    case 'buzz': return cap(1.035, -0.8)
    case 'spiky':
      return <group>{cap(1.06)}{[[-0.08, 0.2, 0.06, -0.4], [0, 0.23, 0.04, 0], [0.08, 0.2, 0.06, 0.4], [-0.05, 0.21, -0.07, -0.3], [0.05, 0.21, -0.07, 0.3], [0, 0.2, 0.12, 0]].map(([x, y, z, r], i) =>
        <mesh key={i} geometry={P.spike} material={hm} position={[x, y, z]} rotation={[z > 0.1 ? 0.6 : z < 0 ? -0.4 : 0.1, 0, r]} />)}</group>
    case 'long':
      return <group>{cap(1.09)}<mesh geometry={P.hairBack} material={hm} scale={[R * 1.1, R * 1.75, R * 1.08]} position={[0, -0.1, -0.01]} /></group>
    case 'bob':
      return <group>{cap(1.1)}<mesh geometry={P.hairBob} material={hm} scale={[R * 1.12, R * 1.2, R * 1.1]} position={[0, -0.02, -0.01]} /></group>
    case 'bun':
      return <group>{cap(1.07)}<mesh geometry={P.head} material={hm} scale={0.1} position={[0, 0.25, -0.08]} /></group>
    case 'ponytail':
      return <group>{cap(1.08)}<mesh geometry={P.head} material={hm} scale={0.055} position={[0, 0.12, -0.25]} />
        <mesh geometry={P.tail} material={hm} position={[0, -0.02, -0.28]} rotation={[0.25, 0, 0]} /></group>
    case 'curly':
      return <group>{Array.from({ length: 16 }, (_, i) => {
        const th = (i / 16) * Math.PI * 2, ring = i % 2
        const y = ring ? 0.17 : 0.07, rr = ring ? 0.15 : 0.215
        if (!ring && Math.cos(th) > 0.55) return null
        return <mesh key={i} geometry={P.head} material={hm} scale={0.075} position={[Math.sin(th) * rr, y, Math.cos(th) * rr * 0.95 - 0.02]} />
      })}<mesh geometry={P.head} material={hm} scale={0.12} position={[0, 0.2, -0.02]} /></group>
    case 'afro':
      return <mesh geometry={P.head} material={hm} scale={[R * 1.38, R * 1.25, R * 1.3]} position={[0, 0.1, -0.06]} castShadow />
    case 'mohawk':
      return <group>{cap(1.03, -0.9)}{[-0.12, -0.04, 0.04, 0.12, 0.19].map((z, i) => <mesh key={i} geometry={P.head} material={hm} scale={[0.03, 0.08, 0.06]} position={[0, 0.235 - Math.abs(z) * 0.25, z * 0.9 - 0.02]} />)}</group>
    case 'sidepart':
      return <group>{cap(1.08)}<mesh geometry={P.head} material={hm} scale={[0.15, 0.06, 0.1]} position={[0.07, 0.17, 0.13]} rotation={[0.4, 0, -0.3]} /></group>
    case 'short': default:
      return <group>{cap(1.08)}<mesh geometry={P.head} material={hm} scale={[0.12, 0.05, 0.09]} position={[-0.05, 0.18, 0.13]} rotation={[0.5, 0, 0.2]} /></group>
  }
}

function Hat({ a }) {
  const hc = mat(a.hatColor || '#ffffff', { r: 0.7 })
  switch (a.hat) {
    case 'toque':
      return <group position={[0, 0.13, -0.02]} rotation={[-0.12, 0, 0]}>
        <mesh geometry={P.toqueBand} material={hc} castShadow />
        <mesh geometry={P.toquePuff} material={hc} position={[0, 0.03, 0]} castShadow />
        {a.role === 'owner' && <mesh geometry={P.toqueBand} material={mat('#f2c14e', { r: 0.4, m: 0.3 })} scale={[1.01, 0.25, 1.01]} position={[0, -0.02, 0]} />}
      </group>
    case 'cap':
      return <group rotation={[-0.25, 0, 0]} position={[0, 0.03, 0]}>
        <mesh geometry={P.capDome} material={hc} scale={[R * 1.07, R * 0.95, R * 1.07]} castShadow />
        <mesh geometry={P.brim} material={hc} scale={[0.17, 0.015, 0.2]} position={[0, 0.005, 0.2]} />
      </group>
    case 'beanie':
      return <group rotation={[-0.3, 0, 0]} position={[0, 0.02, 0]}>
        <mesh geometry={P.capDome} material={hc} scale={[R * 1.1, R * 1.2, R * 1.1]} castShadow />
        <mesh geometry={P.ring} material={mat(darken(a.hatColor), { r: 0.8 })} scale={[R * 1.06, R * 1.06, R * 0.9]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} />
        <mesh geometry={P.head} material={mat('#ffffff')} scale={0.05} position={[0, R * 1.2, 0]} />
      </group>
    case 'visor':
      return <group rotation={[-0.25, 0, 0]} position={[0, 0.06, 0]}>
        <mesh geometry={P.ring} material={hc} scale={[R * 1.02, R * 1.02, R * 0.6]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={P.brim} material={hc} scale={[0.17, 0.014, 0.2]} position={[0, 0, 0.2]} />
      </group>
    case 'helmet':
      return <group position={[0, 0.0, -0.01]} rotation={[-0.15, 0, 0]}>
        <mesh geometry={P.helmet} material={mat(a.hatColor, { r: 0.25, m: 0.1 })} scale={[R * 1.2, R * 1.18, R * 1.2]} castShadow />
        <mesh geometry={P.ring} material={mat('#f2c14e', { r: 0.4 })} scale={[R * 1.17, R * 1.17, R * 0.35]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} />
        <mesh geometry={P.helmet} material={mat('#24324a', { r: 0.1, m: 0.2, op: 0.55 })} scale={[R * 1.05, R * 0.6, R * 1.25]} rotation={[1.25, 0, 0]} position={[0, 0.02, 0.03]} />
      </group>
    default: return null
  }
}

function Face({ a, refs }) {
  const white = mat('#ffffff', { r: 0.25 })
  const pupil = mat(a.eye, { r: 0.2 })
  const dark = mat('#2a1c18', { r: 0.6 })
  const browM = mat(darken(a.hairColor === '#e6e6ea' ? '#9a9aa2' : a.hairColor, -0.05), { r: 0.7 })
  const skinD = mat(darken(a.skin, -0.06), { r: 0.6 })
  const lip = mat('#a5463f', { r: 0.5 })
  return <group>
    {/* Olhos (grupo para piscar) */}
    <group ref={refs.eyes}>
      {[-1, 1].map((s) => <group key={s} position={[s * 0.083, 0.015, 0.2]}>
        <mesh geometry={P.eyeWhite} material={white} scale={[0.047, 0.058, 0.03]} />
        <mesh geometry={P.pupil} material={pupil} scale={[0.028, 0.034, 0.016]} position={[0, -0.004, 0.024]} />
        <mesh geometry={P.pupil} material={dark} scale={[0.015, 0.018, 0.01]} position={[0, -0.004, 0.034]} />
        <mesh geometry={P.pupil} material={white} scale={0.008} position={[0.01, 0.01, 0.04]} />
      </group>)}
    </group>
    {/* Sobrancelhas */}
    <mesh ref={refs.browL} geometry={P.brow} material={browM} position={[0.085, 0.098, 0.212]} />
    <mesh ref={refs.browR} geometry={P.brow} material={browM} position={[-0.085, 0.098, 0.212]} />
    {/* Nariz */}
    {a.nose === 'long'
      ? <mesh geometry={P.head} material={skinD} scale={[0.028, 0.04, 0.04]} position={[0, -0.035, 0.235]} />
      : <mesh geometry={P.head} material={skinD} scale={a.nose === 'small' ? [0.022, 0.02, 0.02] : [0.032, 0.028, 0.03]} position={[0, -0.035, 0.232]} />}
    {/* Bocas (trocadas conforme o humor) */}
    <mesh ref={refs.smile} geometry={P.smile} material={dark} position={[0, -0.075, 0.214]} rotation={[-0.25, 0, 0]} />
    <mesh ref={refs.frown} geometry={P.frown} material={dark} position={[0, -0.135, 0.21]} rotation={[-0.25, 0, 0]} visible={false} />
    <mesh ref={refs.line} geometry={P.mouthLine} material={dark} position={[0, -0.11, 0.218]} visible={false} />
    <mesh ref={refs.open} geometry={P.mouthOpen} material={lip} scale={[0.03, 0.025, 0.015]} position={[0, -0.11, 0.214]} visible={false} />
    {a.blush && [-1, 1].map((s) => <mesh key={s} geometry={P.head} material={mat('#f08f8f', { op: 0.45 })} scale={[0.038, 0.022, 0.015]} position={[s * 0.135, -0.055, 0.185]} />)}
    {a.freckles && [-1, 1].flatMap((s) => [0, 1, 2].map((i) => <mesh key={`${s}${i}`} geometry={P.pupil} material={mat('#a8694a')} scale={0.006} position={[s * (0.11 + i * 0.018), -0.03 - (i % 2) * 0.012, 0.207]} />))}
    {/* Orelhas */}
    {[-1, 1].map((s) => <mesh key={s} geometry={P.ear} material={mat(a.skin, { r: 0.6 })} scale={[0.04, 0.058, 0.035]} position={[s * 0.235, 0.0, 0.0]} />)}
    {a.earrings && [-1, 1].map((s) => <mesh key={s} geometry={P.pupil} material={mat('#f2c14e', { r: 0.3, m: 0.6 })} scale={0.014} position={[s * 0.24, -0.06, 0.01]} />)}
    {/* Barba / bigode */}
    {a.facial === 'beard' && <mesh geometry={P.beard} material={mat(a.hairColor, { r: 0.7 })} scale={[R * 1.05, R * 1.06, R * 1.04]} position={[0, 0, 0.0]} />}
    {(a.facial === 'mustache' || a.facial === 'beard') && <mesh geometry={P.tail} material={mat(a.hairColor, { r: 0.7 })} scale={[0.5, 0.42, 0.45]} rotation={[0, 0, Math.PI / 2]} position={[0, -0.072, 0.228]} />}
    {a.facial === 'goatee' && <mesh geometry={P.head} material={mat(a.hairColor, { r: 0.7 })} scale={[0.04, 0.045, 0.03]} position={[0, -0.19, 0.17]} />}
    {/* Óculos */}
    {a.glasses && <group position={[0, 0.015, 0.238]}>
      {[-1, 1].map((s) => <mesh key={s} geometry={P.glassRing} material={mat(a.glassesColor, { r: 0.3, m: 0.3 })} position={[s * 0.083, 0, 0]} scale={a.glasses === 'square' ? [1.1, 0.85, 1] : 1} />)}
      <mesh geometry={P.box} material={mat(a.glassesColor)} scale={[0.06, 0.012, 0.012]} />
    </group>}
  </group>
}

function Top({ a, w }) {
  const shirt = mat(a.shirt, { r: 0.8 })
  const s2 = mat(a.shirt2, { r: 0.75 })
  const torso = <mesh geometry={P.torso} material={shirt} castShadow />
  const button = (y, x = 0, m = mat('#3a3a40')) => <mesh key={`${x}${y}`} geometry={P.button} material={m} position={[x, y, 0.2]} />
  switch (a.top) {
    case 'chef':
      return <group>{torso}
        {[0.12, 0.22, 0.32].flatMap((y) => [button(y, -0.06, mat('#c9c4b8')), button(y, 0.06, mat('#c9c4b8'))])}
        <mesh geometry={P.ring} material={s2} scale={[0.085, 0.085, 0.18]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.47, 0.01]} />
        <mesh geometry={P.bowtie} material={s2} scale={[1.3, 1.1, 0.6]} position={[0, 0.41, 0.15]} rotation={[Math.PI, 0, 0]} />
        <mesh geometry={P.apron} material={mat(a.role === 'owner' ? '#f7f5f0' : '#f4efe4', { r: 0.85, side: THREE.DoubleSide })} position={[0, -0.02, 0.012]} scale={[1.02, 1, 1.05]} />
        <mesh geometry={P.box} material={mat(a.role === 'owner' ? '#3a7fc4' : '#d84a3a')} scale={[0.36, 0.025, 0.02]} position={[0, 0.16, 0.2]} />
      </group>
    case 'vest':
      return <group>{torso}
        <mesh geometry={P.vestFront} material={s2} position={[0, 0.2, 0]} castShadow />
        {[0.08, 0.16, 0.24].map((y) => button(y, 0.045, mat('#d8c27a', { m: 0.5, r: 0.3 })))}
        <group position={[0, 0.44, 0.13]}>
          <mesh geometry={P.bowtie} material={mat('#c8303a')} rotation={[0, 0, Math.PI / 2]} position={[0.035, 0, 0]} />
          <mesh geometry={P.bowtie} material={mat('#c8303a')} rotation={[0, 0, -Math.PI / 2]} position={[-0.035, 0, 0]} />
        </group>
        <mesh geometry={P.apron} material={mat('#1d1f26', { r: 0.9, side: THREE.DoubleSide })} position={[0, -0.12, 0.01]} scale={[1.04, 0.75, 1.06]} />
      </group>
    case 'polo':
      return <group>{torso}
        <mesh geometry={P.ring} material={s2} scale={[0.09, 0.09, 0.25]} rotation={[Math.PI / 2 - 0.2, 0, 0]} position={[0, 0.47, 0.015]} />
        {[0.38, 0.32].map((y) => button(y, 0, mat('#ffffff')))}
        <mesh geometry={P.box} material={mat('#ffffff')} scale={[0.07, 0.035, 0.01]} position={[0.09, 0.33, 0.185]} />
        <mesh geometry={P.box} material={s2} scale={[0.07, 0.008, 0.012]} position={[0.09, 0.345, 0.19]} />
      </group>
    case 'jacket':
      return <group>{torso}
        <mesh geometry={P.box} material={s2} scale={[0.36, 0.035, 0.01]} position={[0, 0.2, 0.188]} />
        <mesh geometry={P.ring} material={s2} scale={[0.2, 0.2, 0.25]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} />
        <mesh geometry={P.box} material={mat('#c6c6c6', { m: 0.6, r: 0.3 })} scale={[0.012, 0.4, 0.01]} position={[0, 0.25, 0.19]} />
        <mesh geometry={P.ring} material={shirt} scale={[0.095, 0.095, 0.4]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.48, 0]} />
      </group>
    case 'hoodie':
      return <group>{torso}
        <mesh geometry={P.ring} material={shirt} scale={[0.13, 0.13, 0.7]} rotation={[Math.PI / 2 + 0.5, 0, 0]} position={[0, 0.47, -0.06]} />
        <mesh geometry={P.box} material={mat(darken(a.shirt, -0.06), { r: 0.85 })} scale={[0.22, 0.1, 0.03]} position={[0, 0.1, 0.18]} />
        {[-0.04, 0.04].map((x) => <mesh key={x} geometry={P.box} material={mat('#f4f4f4')} scale={[0.008, 0.09, 0.008]} position={[x, 0.38, 0.19]} />)}
      </group>
    case 'stripes':
      return <group>{torso}{[0.1, 0.2, 0.3].map((y) => <mesh key={y} geometry={P.ring} material={s2} scale={[0.2 - Math.abs(y - 0.2) * 0.05, 0.2 - Math.abs(y - 0.2) * 0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]} />)}</group>
    case 'buttoned':
      return <group>{torso}
        <mesh geometry={P.ring} material={mat('#ffffff')} scale={[0.09, 0.09, 0.22]} rotation={[Math.PI / 2 - 0.2, 0, 0]} position={[0, 0.47, 0.015]} />
        {[0.08, 0.17, 0.26, 0.35].map((y) => button(y, 0, mat('#f4f4f4')))}
        <mesh geometry={P.box} material={s2} scale={[0.07, 0.06, 0.01]} position={[-0.09, 0.32, 0.183]} />
      </group>
    case 'sweater':
      return <group>{torso}
        <mesh geometry={P.ring} material={mat(darken(a.shirt, -0.08))} scale={[0.09, 0.09, 0.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.48, 0]} />
        <mesh geometry={P.ring} material={mat(darken(a.shirt, -0.08))} scale={[0.17, 0.17, 0.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} />
        <mesh geometry={P.box} material={s2} scale={[0.2, 0.05, 0.02]} position={[0, 0.27, 0.18]} />
      </group>
    case 'dress':
      return <group>{torso}
        <mesh geometry={P.skirt} material={shirt} position={[0, 0.03, 0]} castShadow />
        <mesh geometry={P.ring} material={s2} scale={[0.18, 0.18, 0.3]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} />
      </group>
    case 'tee': default:
      return <group>{torso}
        <mesh geometry={P.ring} material={mat(darken(a.shirt, -0.08))} scale={[0.08, 0.08, 0.25]} rotation={[Math.PI / 2 - 0.15, 0, 0]} position={[0, 0.48, 0.01]} />
        <mesh geometry={P.circle} material={s2} scale={0.055} position={[0.02, 0.28, 0.192]} />
      </group>
  }
}

function Carry({ type, recipe }) {
  if (!type) return null
  if (type === 'tray') return <group position={[-0.2, 0.6, 0.25]}>
    <mesh geometry={P.disc} material={mat('#c9ced6', { r: 0.25, m: 0.7 })} scale={[0.2, 0.015, 0.2]} />
    <group position={[0, 0.02, 0]} scale={0.55}><PizzaModel recipe={recipe} /></group>
  </group>
  if (type === 'box') return <group position={[0, 0.34, 0.36]}><PizzaBox /></group>
  if (type === 'dough') return <mesh geometry={P.head} material={mat('#f1dcb0', { r: 0.9 })} scale={[0.1, 0.07, 0.1]} position={[0, 0.36, 0.36]} />
  return <group position={[0, 0.34, 0.37]} scale={0.6}><PizzaModel recipe={recipe} raw={type === 'raw'} /></group>
}

export const CharacterModel = memo(function CharacterModel({ appearance: a, id, quality }) {
  const shadows = quality === 'alta'
  const refs = {
    root: useRef(), body: useRef(), torso: useRef(), head: useRef(), legL: useRef(), legR: useRef(),
    kneeL: useRef(), kneeR: useRef(), armL: useRef(), armR: useRef(), elbowL: useRef(), elbowR: useRef(),
    eyes: useRef(), browL: useRef(), browR: useRef(), smile: useRef(), frown: useRef(), line: useRef(), open: useRef(),
    bubble: useRef(), bar: useRef(), barBg: useRef(), ring: useRef(), carry: useRef(),
  }
  const state = useRef({ pose: newPose(), target: newPose(), phase: Math.random() * 6, t: Math.random() * 10, blink: 2 + Math.random() * 3, bubble: null, carry: null })
  const [carry, setCarry] = React.useState(null)
  const bubbleMat = useMemo(() => new THREE.SpriteMaterial({ map: bubbleTexture('order'), depthWrite: false, transparent: true }), [])
  const barMat = useMemo(() => new THREE.SpriteMaterial({ color: '#4cc17a', depthWrite: false }), [])
  const barBgMat = useMemo(() => new THREE.SpriteMaterial({ color: '#1f2a3a', opacity: 0.75, transparent: true, depthWrite: false }), [])
  React.useEffect(() => () => { bubbleMat.dispose(); barMat.dispose(); barBgMat.dispose() }, [bubbleMat, barMat, barBgMat])

  const skin = mat(a.skin, { r: 0.62 })
  const pants = mat(a.pants, { r: 0.85 })
  const shoe = mat(a.shoes, { r: 0.5 })
  const sleeveLong = a.top === 'hoodie' || a.top === 'jacket' || a.top === 'sweater' || a.top === 'chef' || a.top === 'buttoned'
  const sleeveM = mat(a.top === 'vest' ? a.shirt : a.shirt, { r: 0.8 })
  const legsBare = a.top === 'dress'
  const width = a.width

  useFrame((_, dt) => {
    const e = getEntity(id)
    const r = refs.root.current
    if (!e || !r) return
    const st = state.current
    const d = Math.min(dt, 0.05)
    r.visible = !e.hidden
    if (e.hidden) return
    const onDeck = e.x > 8.9 && e.x < 15 && e.z > -4.6 && e.z < 4.4
    r.position.set(e.x, onDeck ? 0.14 : 0.085, e.z)
    r.rotation.y = e.rot
    st.t += d
    if (e.anim === 'walk') st.phase += d * (e.speed || 1.4) * 5.4 / a.height
    computePose(st.target, e.anim, st.t, { phase: st.phase, scale: a.height, mood: e.mood, carry: e.carry, seed: a.height })
    const k = 1 - Math.exp(-d * 11)
    const p = st.pose
    for (const key of POSE_KEYS) p[key] += (st.target[key] - p[key]) * k
    refs.body.current.position.y = p.bodyY
    refs.torso.current.rotation.set(p.lean, p.twist, 0)
    refs.legL.current.rotation.x = p.legL; refs.legR.current.rotation.x = p.legR
    refs.kneeL.current.rotation.x = p.kneeL; refs.kneeR.current.rotation.x = p.kneeR
    refs.armL.current.rotation.set(p.armLx, 0, p.armLz); refs.armR.current.rotation.set(p.armRx, 0, p.armRz)
    refs.elbowL.current.rotation.x = p.elbowL; refs.elbowR.current.rotation.x = p.elbowR
    refs.head.current.rotation.set(p.headX, p.headY, p.headZ)

    // Piscar
    st.blink -= d
    const eyes = refs.eyes.current
    if (st.blink < 0) { eyes.scale.y = 0.12; if (st.blink < -0.12) st.blink = 2 + Math.random() * 4 } else eyes.scale.y = 1

    // Expressão
    const mood = e.anim === 'eat' ? 'eat' : e.mood || 'happy'
    refs.smile.current.visible = mood === 'happy'
    refs.line.current.visible = mood === 'neutral'
    refs.frown.current.visible = mood === 'impatient' || mood === 'angry'
    refs.open.current.visible = mood === 'eat'
    if (mood === 'eat') refs.open.current.scale.y = 0.012 + Math.abs(Math.sin(st.t * 6.4)) * 0.022
    const browAng = mood === 'angry' ? 0.45 : mood === 'impatient' ? 0.25 : mood === 'happy' ? -0.12 : 0
    refs.browL.current.rotation.z = -browAng + a.brow
    refs.browR.current.rotation.z = browAng - a.brow
    refs.browL.current.position.y = refs.browR.current.position.y = mood === 'happy' ? 0.105 : 0.095

    // Objeto carregado (re-render só quando muda)
    const c = e.carry ? `${e.carry}|${e.carryRecipe || e.recipe || ''}` : null
    if (c !== st.carry) { st.carry = c; setCarry(c) }

    // Balão + barra de paciência/progresso
    const b = refs.bubble.current
    const showBubble = e.bubble && e.kind === 'customer' && e.state !== 'passby'
    b.visible = !!showBubble
    if (showBubble && st.bubble !== e.bubble) { st.bubble = e.bubble; bubbleMat.map = bubbleTexture(e.bubble); bubbleMat.needsUpdate = true }
    if (showBubble) b.position.y = 1.78 + Math.sin(st.t * 2.4) * 0.03
    const showBar = e.kind === 'customer' ? ['queue', 'atCounter', 'seated', 'sitting', 'pickupWait', 'toSeat'].includes(e.state) && e.purpose !== 'pay' : e.progress > 0.01
    const bar = refs.bar.current, bg = refs.barBg.current
    bar.visible = bg.visible = showBar
    if (showBar) {
      const v = Math.max(0, Math.min(1, e.kind === 'customer' ? e.patience : e.progress))
      bar.scale.set(0.5 * v, 0.06, 1)
      bar.position.x = -0.25
      barMat.color.set(e.kind === 'customer' ? (v > 0.6 ? '#4cc17a' : v > 0.3 ? '#f2b84b' : '#e5534b') : '#5aa9ff')
      bar.position.y = bg.position.y = e.kind === 'customer' ? 1.52 : 1.7
    }
    // Seleção
    const sel = useGame.getState().selected === e.id
    refs.ring.current.visible = sel
    if (sel) refs.ring.current.rotation.z += d * 1.5
  })

  const [carryType, carryRecipe] = carry ? carry.split('|') : [null, null]
  const hasBackpack = a.bag === 'thermal'

  return <group ref={refs.root} onClick={(ev) => { ev.stopPropagation(); if (ev.delta > 6) return; useGame.getState().select(id) }} scale={a.height}>
    <mesh geometry={P.circle} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} scale={0.34 * width} material={mat('#ffffff', { basic: true, map: blobShadow(), op: 1 })} />
    <mesh ref={refs.ring} geometry={P.ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[0.45, 0.45, 0.3]} material={mat('#ffd24a', { basic: true })} visible={false} />
    <group ref={refs.body}>
      {/* Pernas */}
      {[1, -1].map((s) => <group key={s} ref={s > 0 ? refs.legL : refs.legR} position={[s * 0.095 * width, RIG.hipY, 0]}>
        <mesh geometry={P.thigh} material={legsBare ? skin : pants} castShadow={shadows} />
        <group ref={s > 0 ? refs.kneeL : refs.kneeR} position={[0, -RIG.thigh, 0]}>
          <mesh geometry={P.shin} material={legsBare ? skin : pants} castShadow={shadows} />
          <mesh geometry={P.shoe} material={shoe} scale={[0.075, 0.055, 0.12]} position={[0, -0.255, 0.035]} castShadow={shadows} />
        </group>
      </group>)}
      <mesh geometry={P.hips} material={legsBare ? mat(a.shirt, { r: 0.8 }) : pants} position={[0, RIG.hipY, 0]} scale={[width, 1, width * 0.85]} />
      {/* Tronco */}
      <group ref={refs.torso} position={[0, RIG.hipY - 0.04, 0]}>
        <group scale={[width, 1, width * 0.85]}>
          <Top a={a} w={width} />
          {a.bag === true && <group>
            <mesh geometry={P.ring} material={mat('#6b4a2f')} scale={[0.2, 0.27, 0.2]} rotation={[0.1, Math.PI / 2, 0.6]} position={[0, 0.26, 0]} />
            <mesh geometry={P.box} material={mat('#8a5a3a', { r: 0.6 })} scale={[0.07, 0.12, 0.16]} position={[-0.21, 0.05, 0.02]} />
          </group>}
          {hasBackpack && <group position={[0, 0.27, -0.25]}>
            <mesh geometry={P.box} material={mat('#d8453a', { r: 0.55 })} scale={[0.36, 0.38, 0.24]} castShadow={shadows} />
            <mesh geometry={P.box} material={mat('#f2c14e')} scale={[0.37, 0.05, 0.245]} position={[0, 0.12, 0]} />
            <mesh geometry={P.circle} material={mat('#fff6df')} scale={0.07} position={[0, -0.03, -0.122]} rotation={[0, Math.PI, 0]} />
          </group>}
        </group>
        <mesh geometry={P.neck} material={skin} position={[0, 0.5, 0]} />
        {/* Braços */}
        {[1, -1].map((s) => <group key={s} ref={s > 0 ? refs.armL : refs.armR} position={[s * RIG.shoulderX * width, 0.42, 0]}>
          <mesh geometry={P.upperArm} material={sleeveLong || a.top === 'vest' ? sleeveM : skin} castShadow={shadows} />
          {!sleeveLong && a.top !== 'vest' && <mesh geometry={P.sleeveShort} material={mat(a.shirt, { r: 0.8 })} />}
          <group ref={s > 0 ? refs.elbowL : refs.elbowR} position={[0, -RIG.upperArm, 0]}>
            <mesh geometry={P.forearm} material={sleeveLong ? sleeveM : skin} castShadow={shadows} />
            <mesh geometry={P.hand} material={skin} position={[0, -0.2, 0]} />
          </group>
        </group>)}
        <group ref={refs.carry}><Carry type={carryType} recipe={carryRecipe} /></group>
        {/* Cabeça */}
        <group ref={refs.head} position={[0, 0.55, 0]}>
          <group position={[0, 0.18, 0]} scale={a.headScale}>
            <mesh geometry={P.head} material={skin} scale={[R, R * 1.03, R * 0.95]} castShadow />
            <Face a={a} refs={refs} />
            {!(a.hat === 'helmet') && <Hair a={a} />}
            <Hat a={a} />
          </group>
        </group>
      </group>
    </group>
    <sprite ref={refs.bubble} material={bubbleMat} scale={[0.42, 0.42, 1]} position={[0, 1.8, 0]} visible={false} renderOrder={10} />
    <sprite ref={refs.barBg} material={barBgMat} scale={[0.54, 0.09, 1]} position={[0, 1.52, 0]} visible={false} renderOrder={10} />
    <sprite ref={refs.bar} material={barMat} scale={[0.5, 0.06, 1]} center={[0, 0.5]} position={[-0.25, 1.52, 0]} visible={false} renderOrder={11} />
  </group>
})
