import React, { useEffect } from 'react'
import { useGame, BANKRUPT_DAYS } from './systems/store'
import { eventById } from './data/events'
import { configureAudio, unlockAudio } from './systems/audio'
import { GameCanvas } from './game/GameCanvas'
import { TopBar } from './components/Header/TopBar'
import { Sidebar } from './components/Sidebar/Sidebar'
import { BottomBar } from './components/Controls/BottomBar'
import { CameraControls } from './components/Controls/CameraControls'
import { SelectionCard } from './components/Controls/SelectionCard'
import { Modals } from './components/Controls/Modals'
import { Toasts } from './components/Controls/Toasts'

function useAutosave() {
  useEffect(() => {
    const save = () => useGame.getState().save()
    const id = setInterval(save, 10000)
    window.addEventListener('beforeunload', save)
    const vis = () => { if (document.visibilityState === 'hidden') save() }
    document.addEventListener('visibilitychange', vis)
    return () => { clearInterval(id); window.removeEventListener('beforeunload', save); document.removeEventListener('visibilitychange', vis) }
  }, [])
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return
      const s = useGame.getState()
      if (e.code === 'Space') { e.preventDefault(); s.togglePause() }
      if (e.key === '1') s.setSpeed(1)
      if (e.key === '2') s.setSpeed(2)
      if (e.key === '3') s.setSpeed(4)
      if (e.key === 'Escape') {
        if (s.confirmBox) { s.closeAsk(); return }
        s.setModal(null); s.select(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function useAudioSetup() {
  useEffect(() => {
    configureAudio(useGame.getState().settings)
    const unsub = useGame.subscribe((s, prev) => { if (s.settings !== prev.settings) configureAudio(s.settings) })
    // O navegador só permite iniciar o áudio após um gesto do jogador
    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    return () => { unsub(); window.removeEventListener('pointerdown', unlockAudio); window.removeEventListener('keydown', unlockAudio) }
  }, [])
}

function StatusBanners() {
  const event = useGame((s) => eventById(s.event))
  const debtDays = useGame((s) => s.debtDays)
  const negative = useGame((s) => s.money < 0)
  return <div className="status-banners">
    {event && <div className={`status-banner ${event.tone}`} title={event.desc}><b>{event.name}</b><span>{event.desc}</span></div>}
    {(debtDays > 0 || negative) && <div className="status-banner bad"><b>Caixa no vermelho</b><span>{debtDays}/{BANKRUPT_DAYS} dias até a falência. O saldo é conferido no fechamento.</span></div>}
  </div>
}

export default function App() {
  useAutosave()
  useShortcuts()
  useAudioSetup()
  const paused = useGame((s) => s.paused)
  useEffect(() => {
    const s = useGame.getState()
    if (s.bankrupt) { useGame.setState({ modal: 'bankrupt', paused: true }); return }
    if (!s.tutorialDone || s.offlineEarned > 0) s.setModal('welcome')
  }, [])
  return <main className="tycoon-app">
    <TopBar />
    <div className="sim-layout">
      <section className="map-panel">
        <div className="sim-world">
          <GameCanvas />
          <div className="map-caption"><div><span>SEU NEGÓCIO</span><b>Rua da Pizza, 128 · Centro</b></div><div className={`live-open ${paused ? 'paused' : ''}`}><i /> {paused ? 'PAUSADO' : 'FUNCIONANDO'}</div></div>
          <StatusBanners />
          <CameraControls />
          <SelectionCard />
          <Toasts />
          {paused && <button className="paused-overlay" onClick={() => useGame.getState().togglePause()}>⏸ Jogo pausado — clique para continuar</button>}
        </div>
        <BottomBar />
      </section>
      <Sidebar />
    </div>
    <Modals />
  </main>
}
