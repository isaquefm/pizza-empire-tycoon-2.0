// Som 100% sintetizado (Web Audio): efeitos curtos e uma música ambiente em
// loop. O navegador só libera o áudio depois do primeiro clique do jogador.
let ctx = null, sfxBus = null, musicBus = null, timer = null
let volumes = { sfx: 0.7, music: 0.3 }
let nextBeat = 0, beat = 0
const lastPlayed = {}

const note = (semi) => 261.63 * Math.pow(2, semi / 12) // 0 = dó central

function ensure() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  sfxBus = ctx.createGain(); sfxBus.gain.value = volumes.sfx; sfxBus.connect(ctx.destination)
  musicBus = ctx.createGain(); musicBus.gain.value = volumes.music * 0.5; musicBus.connect(ctx.destination)
  return ctx
}

function tone(bus, freq, start, dur, { type = 'sine', vol = 0.3, slide = 0 } = {}) {
  const osc = ctx.createOscillator(), gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), start + dur)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain); gain.connect(bus)
  osc.start(start); osc.stop(start + dur + 0.02)
}

function noise(start, dur, vol) {
  const len = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ctx.createBufferSource(), gain = ctx.createGain(), filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'; filter.frequency.value = 900
  gain.gain.value = vol
  src.buffer = buf; src.connect(filter); filter.connect(gain); gain.connect(sfxBus)
  src.start(start)
}

const SOUNDS = {
  click: (t) => tone(sfxBus, 620, t, 0.05, { type: 'triangle', vol: 0.12 }),
  buy: (t) => { [0, 4, 7, 12].forEach((n, i) => tone(sfxBus, note(n + 12), t + i * 0.06, 0.16, { type: 'triangle', vol: 0.22 })) },
  upgrade: (t) => { [7, 12, 16, 19, 24].forEach((n, i) => tone(sfxBus, note(n), t + i * 0.05, 0.18, { type: 'triangle', vol: 0.2 })) },
  hire: (t) => { [0, 7, 12].forEach((n, i) => tone(sfxBus, note(n + 5), t + i * 0.09, 0.2, { type: 'sine', vol: 0.26 })) },
  star: (t) => { [0, 4, 7, 11, 14, 19, 24].forEach((n, i) => tone(sfxBus, note(n + 7), t + i * 0.055, 0.28, { type: 'triangle', vol: 0.2 })) },
  sale: (t) => { tone(sfxBus, 1320, t, 0.07, { type: 'square', vol: 0.05 }); tone(sfxBus, 1760, t + 0.06, 0.12, { type: 'square', vol: 0.05 }) },
  oven: (t) => { noise(t, 0.28, 0.1); tone(sfxBus, 170, t, 0.18, { type: 'sine', vol: 0.1, slide: -70 }) },
  level: (t) => { [0, 4, 7, 12, 16].forEach((n, i) => tone(sfxBus, note(n + 12), t + i * 0.1, 0.28, { type: 'triangle', vol: 0.24 })) },
  goal: (t) => { [7, 12, 16].forEach((n, i) => tone(sfxBus, note(n + 12), t + i * 0.08, 0.22, { type: 'sine', vol: 0.22 })) },
  warn: (t) => { tone(sfxBus, 210, t, 0.14, { type: 'sawtooth', vol: 0.09 }); tone(sfxBus, 160, t + 0.11, 0.18, { type: 'sawtooth', vol: 0.09 }) },
  event: (t) => { tone(sfxBus, note(12), t, 0.2, { vol: 0.2 }); tone(sfxBus, note(19), t + 0.14, 0.32, { vol: 0.2 }) },
  dayEnd: (t) => { [12, 7, 4, 0].forEach((n, i) => tone(sfxBus, note(n + 12), t + i * 0.13, 0.32, { vol: 0.2 })) },
  bankrupt: (t) => { [7, 6, 5, 0].forEach((n, i) => tone(sfxBus, note(n - 5), t + i * 0.28, 0.5, { type: 'triangle', vol: 0.26 })) },
}

const MIN_GAP = { sale: 0.14, oven: 0.25, click: 0.03 }

export function sfx(name) {
  if (!ctx || ctx.state !== 'running' || volumes.sfx <= 0 || !SOUNDS[name]) return
  const now = ctx.currentTime
  if (now - (lastPlayed[name] ?? -1) < (MIN_GAP[name] ?? 0.05)) return
  lastPlayed[name] = now
  SOUNDS[name](now + 0.005)
}

// ---- Música: valsa simples em dó maior, 16 compassos em 3/4
const CHORDS = [[0, 4, 7], [0, 4, 7], [5, 9, 12], [5, 9, 12], [7, 11, 14], [7, 11, 14], [0, 4, 7], [7, 11, 14],
  [9, 12, 16], [9, 12, 16], [5, 9, 12], [0, 4, 7], [2, 5, 9], [7, 11, 14], [0, 4, 7], [0, 4, 7]]
const MELODY = [12, 16, 19, 17, 16, 14, 17, 21, 24, 21, 19, 17, 19, 23, 26, 24, 23, 21, 19, 16, 12, 14, 16, 19,
  21, 24, 28, 24, 21, 19, 17, 21, 24, 19, 16, 12, 14, 17, 21, 19, 17, 14, 12, 16, 19, 24, null, null]
const BEAT = 0.42

function scheduleMusic() {
  if (!ctx || ctx.state !== 'running') return
  if (nextBeat < ctx.currentTime) nextBeat = ctx.currentTime + 0.05
  while (nextBeat < ctx.currentTime + 0.5) {
    const chord = CHORDS[Math.floor(beat / 3) % CHORDS.length], inBar = beat % 3
    if (inBar === 0) tone(musicBus, note(chord[0] - 12), nextBeat, BEAT * 1.6, { type: 'triangle', vol: 0.3 })
    else chord.slice(1).forEach((n) => tone(musicBus, note(n), nextBeat, BEAT * 0.7, { type: 'sine', vol: 0.09 }))
    const m = MELODY[beat % MELODY.length]
    if (m != null) tone(musicBus, note(m), nextBeat, BEAT * 1.1, { type: 'triangle', vol: 0.13 })
    nextBeat += BEAT
    beat++
  }
}

// Aplica volumes salvos nas configurações
export function configureAudio({ sfx: s = volumes.sfx, music: m = volumes.music } = {}) {
  volumes = { sfx: s, music: m }
  if (!ctx) return
  sfxBus.gain.value = s
  musicBus.gain.value = m * 0.5
}

// Chamar a partir de um gesto do usuário
export function unlockAudio() {
  if (!ensure()) return
  if (ctx.state === 'suspended') ctx.resume()
  if (!timer) timer = setInterval(scheduleMusic, 150)
}
