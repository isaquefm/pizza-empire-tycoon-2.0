// Gerador de aparência modular: combina rosto, cabelo, roupas, cores,
// proporções e acessórios a partir de uma semente (determinístico).

export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]

export const SKINS = ['#ffe0c7', '#f7cfae', '#eebb94', '#d9a27a', '#c08560', '#a16c4a', '#82533a', '#5f3b29']
export const HAIR_COLORS = ['#2b1d16', '#3d2a1f', '#5a3a22', '#7b4b2a', '#a86b3c', '#d2a05a', '#e8c98a', '#1d1d24', '#8a8a92', '#b5452f', '#6b3f7a']
const SHIRTS = ['#e45d50', '#f08a4b', '#f2c14e', '#7cbf6b', '#3fa39a', '#4c8fd6', '#6a6fd1', '#a76bc9', '#e27aa6', '#f4efe6', '#3b4a5e', '#8fb8d8', '#c9a37a']
const PANTS = ['#2f3e57', '#3c4b64', '#5b6b80', '#2a2f38', '#6b5a49', '#8a7b66', '#4f6b52', '#33507a', '#a4865f']
const SHOES = ['#2a2a2e', '#f4f4f4', '#7a4a2e', '#c0453b', '#38598f', '#e6c35c']
const EYES = ['#2a1a12', '#3b2a1e', '#2f4a63', '#3e5c3a', '#5a4026']

const HAIR_STYLES = ['short', 'spiky', 'long', 'bob', 'bun', 'ponytail', 'curly', 'afro', 'bald', 'sidepart', 'buzz', 'mohawk']
const TOPS = ['tee', 'tee', 'hoodie', 'dress', 'jacket', 'stripes', 'buttoned', 'sweater']

export function makeAppearance(seed, role = 'customer') {
  const r = rng(seed)
  const kid = role === 'customer' && r() < 0.1
  const elder = !kid && role === 'customer' && r() < 0.14
  const a = {
    role,
    skin: pick(r, SKINS),
    hairStyle: pick(r, HAIR_STYLES),
    hairColor: elder ? pick(r, ['#c9c9cf', '#e6e6ea', '#9a9aa2']) : pick(r, HAIR_COLORS),
    eye: pick(r, EYES),
    top: pick(r, TOPS),
    shirt: pick(r, SHIRTS),
    shirt2: pick(r, SHIRTS),
    pants: pick(r, PANTS),
    shoes: pick(r, SHOES),
    height: kid ? 0.72 + r() * 0.08 : 0.92 + r() * 0.16,
    width: 0.9 + r() * 0.25,
    headScale: kid ? 1.12 : 0.96 + r() * 0.08,
    brow: r() * 0.3 - 0.15,
    facial: !kid && r() < 0.22 ? pick(r, ['beard', 'mustache', 'goatee']) : 'none',
    glasses: r() < 0.22 ? pick(r, ['round', 'square']) : null,
    glassesColor: pick(r, ['#2a2a2e', '#7a3d2a', '#3256a8', '#b23b3b']),
    hat: role === 'customer' && r() < 0.14 ? pick(r, ['cap', 'beanie']) : null,
    hatColor: pick(r, SHIRTS),
    bag: role === 'customer' && r() < 0.18,
    earrings: r() < 0.2,
    blush: r() < 0.6,
    freckles: r() < 0.15,
    nose: pick(r, ['round', 'small', 'long']),
    kid, elder,
  }
  if (a.hairStyle === 'bald' && a.facial === 'none' && r() < 0.5) a.facial = 'beard'
  if (a.top === 'dress') a.pants = a.skin // pernas à mostra com vestido

  // Uniformes profissionais
  if (role === 'chef') Object.assign(a, { top: 'chef', shirt: '#f7f5f0', shirt2: '#d84a3a', pants: pick(r, ['#2d2f36', '#3b3f4a']), shoes: '#2a2a2e', hat: 'toque', hatColor: '#fbfaf6', bag: false })
  if (role === 'owner') Object.assign(a, { top: 'chef', shirt: '#3a7fc4', shirt2: '#f2c14e', pants: '#2b3445', shoes: '#2a2a2e', hat: 'toque', hatColor: '#fbfaf6', bag: false, hairStyle: 'short', hairColor: '#3d2a1f', skin: '#eebb94', facial: 'mustache', glasses: null })
  if (role === 'waiter') Object.assign(a, { top: 'vest', shirt: '#f7f5f0', shirt2: '#2a2d36', pants: '#24272f', shoes: '#1d1d22', hat: null, bag: false })
  if (role === 'cashier') Object.assign(a, { top: 'polo', shirt: '#d8453a', shirt2: '#f2c14e', pants: '#2f3e57', shoes: '#f4f4f4', hat: 'visor', hatColor: '#d8453a', bag: false })
  if (role === 'courier') Object.assign(a, { top: 'jacket', shirt: '#e0473a', shirt2: '#f2c14e', pants: '#2a2f38', shoes: '#2a2a2e', hat: 'helmet', hatColor: '#e0473a', bag: 'thermal', glasses: null })
  if (role !== 'customer') { a.height = Math.max(0.94, a.height); a.kid = false }
  return a
}
