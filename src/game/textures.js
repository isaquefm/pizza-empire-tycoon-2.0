// Texturas procedurais geradas em canvas (sem arquivos externos/licenças).
import * as THREE from 'three'

const cache = new Map()
const FONT = "'Nunito', 'Segoe UI', 'Arial Rounded MT Bold', Arial, sans-serif"

function make(key, w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  const k = `${key}|${repeat.join('x')}`
  if (cache.has(k)) return cache.get(k)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  draw(ctx, w, h)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = 4
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  cache.set(k, t)
  return t
}

const noise = (ctx, w, h, n, alpha, light = false) => {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = light ? `rgba(255,255,255,${Math.random() * alpha})` : `rgba(0,0,0,${Math.random() * alpha})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2)
  }
}

const shade = (hex, f) => {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, f)
  return `#${c.getHexString()}`
}

// Piso de tábuas de madeira
export const woodFloor = (base = '#c8925c', repeat = [4, 4]) => make(`wood${base}`, 512, 512, (ctx, w, h) => {
  const rows = 8, rh = h / rows
  for (let r = 0; r < rows; r++) {
    let x = -(r % 2) * 120
    while (x < w) {
      const len = 180 + Math.random() * 160
      ctx.fillStyle = shade(base, (Math.random() - 0.5) * 0.08)
      ctx.fillRect(x, r * rh, len, rh)
      ctx.strokeStyle = 'rgba(70,40,20,0.10)'
      for (let g = 0; g < 6; g++) {
        ctx.beginPath()
        const y = r * rh + 4 + Math.random() * (rh - 8)
        ctx.moveTo(x, y)
        ctx.bezierCurveTo(x + len * 0.3, y + 3, x + len * 0.6, y - 3, x + len, y)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(60,35,15,0.45)'
      ctx.fillRect(x, r * rh, 2, rh)
      x += len
    }
    ctx.fillStyle = 'rgba(60,35,15,0.4)'
    ctx.fillRect(0, r * rh, w, 2)
  }
  noise(ctx, w, h, 1800, 0.06)
}, { repeat })

// Piso xadrez da cozinha
export const checkerTile = (a = '#f2ede4', b = '#d2463c', repeat = [8, 3]) => make(`checker${a}${b}`, 256, 256, (ctx, w, h) => {
  const n = 4, s = w / n
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    ctx.fillStyle = (x + y) % 2 ? b : a
    ctx.fillRect(x * s, y * s, s, s)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(x * s + 3, y * s + 3, s - 6, 6)
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2
  for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); ctx.stroke() }
  noise(ctx, w, h, 500, 0.05)
}, { repeat })

// Azulejo "metrô" para a parede da cozinha
export const subwayTile = (base = '#f4f6f4', repeat = [6, 3]) => make(`subway${base}`, 256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#c9cfcb'; ctx.fillRect(0, 0, w, h)
  const rows = 8, rh = h / rows, tw = w / 4
  for (let r = 0; r < rows; r++) for (let i = -1; i < 5; i++) {
    const x = i * tw + (r % 2) * tw / 2
    ctx.fillStyle = shade(base, (Math.random() - 0.5) * 0.03)
    ctx.fillRect(x + 2, r * rh + 2, tw - 4, rh - 4)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillRect(x + 4, r * rh + 4, tw - 10, 3)
  }
}, { repeat })

// Tijolinho para fachadas
export const brick = (base = '#b5563f', repeat = [4, 2]) => make(`brick${base}`, 256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#d9cbb8'; ctx.fillRect(0, 0, w, h)
  const rows = 10, rh = h / rows, bw = w / 4
  for (let r = 0; r < rows; r++) for (let i = -1; i < 5; i++) {
    const x = i * bw + (r % 2) * bw / 2
    ctx.fillStyle = shade(base, (Math.random() - 0.5) * 0.1)
    ctx.fillRect(x + 2, r * rh + 2, bw - 4, rh - 4)
  }
  noise(ctx, w, h, 900, 0.08)
}, { repeat })

// Reboco/pintura com leve variação
export const plaster = (base = '#f3e6cf', repeat = [3, 1]) => make(`plaster${base}`, 256, 256, (ctx, w, h) => {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h)
  noise(ctx, w, h, 2500, 0.035)
  noise(ctx, w, h, 1500, 0.08, true)
}, { repeat })

// Asfalto
export const asphalt = (repeat = [10, 2]) => make('asphalt', 256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#5d6270'; ctx.fillRect(0, 0, w, h)
  noise(ctx, w, h, 5000, 0.18)
  noise(ctx, w, h, 2500, 0.08, true)
}, { repeat })

// Calçada de placas
export const pavers = (base = '#d9d4c8', repeat = [12, 1]) => make(`pavers${base}`, 256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#b9b3a6'; ctx.fillRect(0, 0, w, h)
  const n = 4, s = w / n
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    ctx.fillStyle = shade(base, (Math.random() - 0.5) * 0.06)
    ctx.fillRect(x * s + 2, y * s + 2, s - 4, s - 4)
  }
  noise(ctx, w, h, 1200, 0.06)
}, { repeat })

// Grama
export const grass = (repeat = [14, 14]) => make('grass', 256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#86b86a'; ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(70,130,60,0.35)' : 'rgba(170,210,120,0.35)'
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 4)
  }
}, { repeat })

// Deck de madeira (varanda)
export const deck = (repeat = [6, 1]) => woodFloor('#b98a5e', repeat)

// Listras do toldo
export const stripes = (a = '#d8453a', b = '#fff6e8', repeat = [6, 1]) => make(`stripes${a}${b}`, 128, 64, (ctx, w, h) => {
  ctx.fillStyle = b; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = a; ctx.fillRect(0, 0, w / 2, h)
}, { repeat })

// Toalha xadrez
export const gingham = (c = '#d8453a', repeat = [1, 1]) => make(`gingham${c}`, 128, 128, (ctx, w, h) => {
  ctx.fillStyle = '#fffaf2'; ctx.fillRect(0, 0, w, h)
  const n = 8, s = w / n
  ctx.globalAlpha = 0.55; ctx.fillStyle = c
  for (let i = 0; i < n; i += 2) { ctx.fillRect(i * s, 0, s, h); ctx.fillRect(0, i * s, w, s) }
  ctx.globalAlpha = 1
}, { repeat })

// Letreiro principal
export const signTexture = (lit = false) => make(`sign${lit}`, 1024, 256, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, lit ? '#e2483b' : '#c8423a'); g.addColorStop(1, lit ? '#b8302a' : '#a3352f')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.roundRect(8, 8, w - 16, h - 16, 50); ctx.fill()
  ctx.lineWidth = 10; ctx.strokeStyle = '#ffd76a'; ctx.stroke()
  ctx.font = `900 120px ${FONT}`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  if (lit) { ctx.shadowColor = '#fff2a8'; ctx.shadowBlur = 30 }
  ctx.fillStyle = '#fff6df'
  ctx.fillText('PIZZA EMPIRE', w / 2 + 40, h / 2 + 6)
  ctx.shadowBlur = 0
  // fatia de pizza
  ctx.save(); ctx.translate(120, h / 2)
  ctx.fillStyle = '#f3b543'; ctx.beginPath(); ctx.moveTo(-50, -55); ctx.lineTo(55, -40); ctx.lineTo(0, 65); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#c9762f'; ctx.beginPath(); ctx.moveTo(-55, -62); ctx.lineTo(60, -46); ctx.lineTo(56, -32); ctx.lineTo(-50, -48); ctx.fill()
  ctx.fillStyle = '#d23b2f'; [[-14, -20], [18, -12], [2, 18]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill() })
  ctx.restore()
}, { srgb: true })

// Textos simples (placas, rótulos)
export const labelTexture = (text, { bg = '#2f3b52', fg = '#ffffff', w = 512, h = 128, size = 64, radius = 28, border = null } = {}) =>
  make(`label${text}${bg}${fg}${w}${h}${size}${border}`, w, h, (ctx) => {
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.roundRect(4, 4, w - 8, h - 8, radius); ctx.fill()
    if (border) { ctx.lineWidth = 6; ctx.strokeStyle = border; ctx.stroke() }
    ctx.fillStyle = fg
    ctx.font = `900 ${size}px ${FONT}`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(text, w / 2, h / 2 + 4)
  })

// Quadro-negro do cardápio
export const menuBoard = () => make('menuboard', 512, 384, (ctx, w, h) => {
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#2e3a34'; ctx.fillRect(16, 16, w - 32, h - 32)
  noise(ctx, w, h, 1500, 0.08, true)
  ctx.fillStyle = '#f6efe0'; ctx.textAlign = 'center'
  ctx.font = `900 46px ${FONT}`; ctx.fillText('CARDÁPIO', w / 2, 70)
  ctx.font = `700 28px ${FONT}`; ctx.textAlign = 'left'
  const items = [['Margherita', '18'], ['Calabresa', '22'], ['4 Queijos', '28'], ['Portuguesa', '32'], ['Pepperoni', '40']]
  items.forEach(([n, p], i) => {
    ctx.fillStyle = i % 2 ? '#f2c14e' : '#f6efe0'
    ctx.fillText(n, 50, 125 + i * 46)
    ctx.textAlign = 'right'; ctx.fillText(`R$ ${p}`, w - 50, 125 + i * 46); ctx.textAlign = 'left'
  })
})

// Quadros decorativos (paisagens estilizadas)
export const painting = (i) => make(`painting${i}`, 256, 200, (ctx, w, h) => {
  const skies = [['#9fd0e8', '#f7e3b0'], ['#f5b27a', '#f8e1c2'], ['#a6c8e6', '#e8f1f5'], ['#d99aa8', '#f6d7c3'], ['#86b4d6', '#cde3c8']]
  const [s1, s2] = skies[i % skies.length]
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, s1); g.addColorStop(1, s2)
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#f7d36b'; ctx.beginPath(); ctx.arc(60 + i * 30, 55, 22, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = ['#6f9b5b', '#7a8f63', '#5d8a6a', '#8d7c5b', '#5b7f9b'][i % 5]
  ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, 130); ctx.quadraticCurveTo(70, 80, 140, 120); ctx.quadraticCurveTo(200, 150, w, 110); ctx.lineTo(w, h); ctx.fill()
  if (i % 2 === 0) { // torre/casinhas italianas
    ctx.fillStyle = '#e9d6b5'; ctx.fillRect(150, 70, 26, 70); ctx.fillStyle = '#c2643f'; ctx.fillRect(146, 64, 34, 10)
  } else {
    ctx.fillStyle = '#e35b46'; ctx.beginPath(); ctx.arc(90, 140, 28, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#f3d27a'; ctx.beginPath(); ctx.arc(90, 140, 20, 0, Math.PI * 2); ctx.fill()
  }
})

// Fachadas de lojas vizinhas
export const shopSign = (text, bg, fg = '#fff') => labelTexture(text, { bg, fg, w: 512, h: 112, size: 58, radius: 18 })

// Sombra circular suave (para personagens e objetos)
export const blobShadow = () => make('blob', 128, 128, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(0.55, 'rgba(0,0,0,0.2)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
}, { srgb: false })

// Glow radial para luzes
export const glow = (color = '#ffd88a') => make(`glow${color}`, 128, 128, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
  g.addColorStop(0, color); g.addColorStop(0.3, `${color}88`); g.addColorStop(1, `${color}00`)
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
})

// Balões de pensamento dos personagens
const BUBBLES = {
  order: { bg: '#ffffff', draw: (ctx) => pizzaIcon(ctx, 64, 58, 26) },
  wait: { bg: '#fff7e6', draw: (ctx) => { pizzaIcon(ctx, 64, 58, 22); clockIcon(ctx, 92, 34) } },
  pay: { bg: '#e9f8ee', draw: (ctx) => { ctx.fillStyle = '#2f9e5b'; ctx.font = `900 58px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 64, 60) } },
  happy: { bg: '#ffeef2', draw: (ctx) => heart(ctx, 64, 60, '#e2476b') },
  angry: { bg: '#ffe7e2', draw: (ctx) => angryIcon(ctx) },
  eat: { bg: '#fff4d6', draw: (ctx) => { ctx.fillStyle = '#e8a33a'; ctx.font = `900 40px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♪', 64, 58) } },
}
function pizzaIcon(ctx, x, y, r) {
  ctx.fillStyle = '#e9a43c'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#f4cf5d'; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#d23b2f';
  [[-0.35, -0.3], [0.35, -0.2], [0, 0.35], [-0.3, 0.25], [0.3, 0.35]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(x + a * r, y + b * r, r * 0.15, 0, Math.PI * 2); ctx.fill() })
}
function clockIcon(ctx, x, y) {
  ctx.fillStyle = '#4c5d78'; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 9); ctx.moveTo(x, y); ctx.lineTo(x + 7, y); ctx.stroke()
}
function heart(ctx, x, y, c) {
  ctx.fillStyle = c; ctx.beginPath()
  ctx.moveTo(x, y + 22); ctx.bezierCurveTo(x - 40, y - 5, x - 18, y - 34, x, y - 14); ctx.bezierCurveTo(x + 18, y - 34, x + 40, y - 5, x, y + 22); ctx.fill()
}
function angryIcon(ctx) {
  ctx.strokeStyle = '#d23b2f'; ctx.lineWidth = 8; ctx.lineCap = 'round'
  ;[[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => {
    const x = 44 + a * 40, y = 38 + b * 40
    ctx.beginPath(); ctx.moveTo(x - 8 * (a ? -1 : 1), y); ctx.quadraticCurveTo(x, y, x, y - 8 * (b ? -1 : 1)); ctx.stroke()
  })
}
export const bubbleTexture = (type) => make(`bubble${type}`, 128, 128, (ctx, w, h) => {
  const b = BUBBLES[type] || BUBBLES.order
  ctx.fillStyle = 'rgba(30,40,60,0.18)'
  ctx.beginPath(); ctx.ellipse(66, 62, 52, 46, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = b.bg
  ctx.beginPath(); ctx.ellipse(64, 58, 50, 44, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.moveTo(50, 96); ctx.lineTo(64, 120); ctx.lineTo(74, 96); ctx.fill()
  ctx.lineWidth = 4; ctx.strokeStyle = '#2f3b52'
  ctx.beginPath(); ctx.ellipse(64, 58, 50, 44, 0, 0, Math.PI * 2); ctx.stroke()
  b.draw(ctx, w, h)
}, { srgb: true })

// Texto flutuante (+R$)
const popupCache = new Map()
export function popupTexture(text, color) {
  const key = text + color
  if (popupCache.has(key)) return popupCache.get(key)
  const c = document.createElement('canvas')
  c.width = 512; c.height = 128
  const ctx = c.getContext('2d')
  ctx.font = `900 70px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.lineWidth = 14; ctx.strokeStyle = '#ffffff'; ctx.strokeText(text, 256, 66)
  ctx.fillStyle = color; ctx.fillText(text, 256, 66)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  if (popupCache.size > 60) { const first = popupCache.keys().next().value; popupCache.get(first).dispose(); popupCache.delete(first) }
  popupCache.set(key, t)
  return t
}

export function disposeTextures() {
  cache.forEach((t) => t.dispose()); cache.clear()
  popupCache.forEach((t) => t.dispose()); popupCache.clear()
}
