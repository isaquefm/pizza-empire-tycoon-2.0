// Animações procedurais compartilhadas. Cada animação define uma pose-alvo;
// o modelo interpola suavemente entre poses (transições naturais).
// Convenção: rotação.x negativa leva o membro para a frente (+z).

export const POSE_KEYS = ['bodyY', 'lean', 'twist', 'legL', 'legR', 'kneeL', 'kneeR', 'armLx', 'armLz', 'armRx', 'armRz', 'elbowL', 'elbowR', 'headX', 'headY', 'headZ']

export const newPose = () => Object.fromEntries(POSE_KEYS.map((k) => [k, 0]))

function base(p) {
  for (const k of POSE_KEYS) p[k] = 0
  p.armLz = 0.08; p.armRz = -0.08; p.elbowL = -0.15; p.elbowR = -0.15
  return p
}

export function computePose(p, anim, t, ctx) {
  base(p)
  const { phase, scale = 1, mood, carry, seed = 0 } = ctx
  const s = seed * 7.13
  switch (anim) {
    case 'walk': {
      const sw = Math.sin(phase)
      const amp = mood === 'angry' ? 0.75 : 0.6
      p.legL = sw * amp; p.legR = -sw * amp
      p.kneeL = 0.12 + Math.max(0, Math.sin(phase - 1.3)) * 0.95
      p.kneeR = 0.12 + Math.max(0, Math.sin(phase + Math.PI - 1.3)) * 0.95
      p.armLx = -sw * 0.5; p.armRx = sw * 0.5
      p.elbowL = -0.35; p.elbowR = -0.35
      p.bodyY = Math.abs(Math.cos(phase)) * 0.035 - 0.01
      p.twist = sw * 0.08
      p.lean = mood === 'angry' ? 0.12 : 0.04
      p.headX = mood === 'angry' ? 0.12 : 0
      p.headZ = mood === 'happy' ? Math.sin(phase) * 0.05 : 0
      break
    }
    case 'sit': case 'eat': case 'sitWait': {
      p.legL = -1.45; p.legR = -1.45; p.kneeL = 1.45; p.kneeR = 1.45
      p.bodyY = 0.5 / scale - 0.48
      p.armLx = -0.75; p.armRx = -0.75; p.elbowL = -0.55; p.elbowR = -0.55
      p.lean = 0.05
      if (anim === 'eat') {
        const c = (Math.sin(t * 3.2) + 1) / 2
        p.armRx = -1.0 - c * 0.55; p.elbowR = -1.3 - c * 0.6; p.armRz = -0.25
        p.headX = 0.12 - c * 0.12
        p.lean = 0.12
      } else if (mood === 'impatient') {
        p.armLx = -0.85 + Math.abs(Math.sin(t * 9)) * 0.12
        p.headY = Math.sin(t * 1.7) * 0.5
        p.legL = -1.45 + Math.abs(Math.sin(t * 8)) * 0.12
      } else {
        p.headY = Math.sin(t * 0.6 + s) * 0.35
        p.headX = Math.sin(t * 0.4 + s) * 0.08
      }
      break
    }
    case 'knead': {
      const k = Math.sin(t * 7.5)
      p.armLx = -0.95 + k * 0.22; p.armRx = -0.95 - k * 0.22
      p.elbowL = -0.55; p.elbowR = -0.55; p.armLz = -0.12; p.armRz = 0.12
      p.lean = 0.22; p.headX = 0.3; p.bodyY = Math.abs(k) * 0.01
      break
    }
    case 'oven': {
      const k = Math.sin(t * 3)
      p.armLx = -1.25 + k * 0.15; p.armRx = -1.25 + k * 0.15
      p.elbowL = -0.15; p.elbowR = -0.15; p.armLz = -0.1; p.armRz = 0.1
      p.lean = 0.18 + k * 0.05; p.headX = 0.12
      break
    }
    case 'grab': {
      const k = Math.sin(t * 5)
      p.armRx = -1.1 + k * 0.2; p.elbowR = -0.3; p.armLx = -0.5; p.elbowL = -0.6
      p.lean = 0.25; p.headX = 0.2
      break
    }
    case 'register': {
      p.armLx = -0.75 + Math.sin(t * 13) * 0.06; p.armRx = -0.75 + Math.sin(t * 13 + 2) * 0.06
      p.elbowL = -0.9; p.elbowR = -0.9; p.armLz = -0.05; p.armRz = 0.05
      p.headX = 0.25; p.headY = Math.sin(t * 1.3) * 0.2; p.lean = 0.06
      break
    }
    case 'cut': {
      const k = Math.sin(t * 10)
      p.armRx = -0.85 + k * 0.28; p.elbowR = -0.85; p.armLx = -0.75; p.elbowL = -0.7
      p.armLz = -0.15; p.lean = 0.2; p.headX = 0.32
      break
    }
    case 'serve': {
      p.armRx = -1.25; p.elbowR = -0.25; p.armLx = -1.05; p.elbowL = -0.3
      p.lean = 0.22; p.headX = 0.15
      break
    }
    case 'wipe': {
      p.armRx = -0.95 + Math.sin(t * 6) * 0.18; p.armRz = -0.1 + Math.cos(t * 6) * 0.3
      p.elbowR = -0.35; p.armLx = -0.4; p.elbowL = -0.8
      p.lean = 0.38; p.headX = 0.25; p.kneeL = 0.15; p.kneeR = 0.15
      break
    }
    case 'idleCounter': {
      p.armLx = -0.55; p.armRx = -0.55; p.elbowL = -0.75; p.elbowR = -0.75
      p.headY = Math.sin(t * 0.7 + s) * 0.3
      p.bodyY = Math.sin(t * 2) * 0.004
      break
    }
    case 'idle': default: {
      p.bodyY = Math.sin(t * 2 + s) * 0.005
      p.headY = Math.sin(t * 0.55 + s) * 0.35
      p.headX = Math.sin(t * 0.37 + s) * 0.06
      p.armLz = 0.1 + Math.sin(t * 2 + s) * 0.02; p.armRz = -0.1 - Math.sin(t * 2 + s) * 0.02
      if (mood === 'impatient') {
        // bate o pé e cruza os braços
        p.armLx = -0.9; p.armRx = -0.9; p.elbowL = -1.6; p.elbowR = -1.6; p.armLz = -0.35; p.armRz = 0.35
        p.legR = -Math.abs(Math.sin(t * 7)) * 0.15
        p.headY = Math.sin(t * 2.2) * 0.25
      } else if (mood === 'angry') {
        p.armLx = -0.2; p.armRx = -0.2; p.elbowL = -1.2; p.elbowR = -1.2; p.armLz = 0.5; p.armRz = -0.5
      }
    }
  }
  // Carregando algo: braços seguram à frente (sobrepõe parte superior)
  if (carry && anim !== 'sit' && anim !== 'eat' && anim !== 'serve' && anim !== 'cut' && anim !== 'oven') {
    if (carry === 'tray') {
      p.armRx = -1.25; p.elbowR = -1.45; p.armRz = -0.25
      p.armLx = anim === 'walk' ? p.armLx * 0.6 : 0; p.twist *= 0.3
    } else {
      p.armLx = -1.05; p.armRx = -1.05; p.elbowL = -0.55; p.elbowR = -0.55; p.armLz = -0.12; p.armRz = 0.12; p.twist *= 0.3
    }
  }
  return p
}
