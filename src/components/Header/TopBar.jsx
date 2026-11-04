import React from 'react'
import { Pizza, Wallet, Users, ClipboardList, Heart, Star, TrendingUp, CalendarDays, Play, Pause, Save, Settings, Sun, Moon } from 'lucide-react'
import { useGame, satisfactionOf, starsOf } from '../../systems/store'
import { money, clockStr } from '../ui'
import { levelThreshold } from '../../systems/Economy/economy'

function Kpi({ icon: Icon, label, value, sub, className = '', title }) {
  return <div className={`kpi ${className}`} title={title}>
    <span className="kpi-icon"><Icon /></span>
    <div><small>{label}</small><b>{value}</b>{sub && <em>{sub}</em>}</div>
  </div>
}

export function TopBar() {
  const s = useGame()
  const sat = satisfactionOf(s)
  const stars = starsOf(s)
  const hour = Math.floor(s.clock / 60)
  const night = hour >= 19 || hour < 7
  const next = levelThreshold(s.level + 1), prev = levelThreshold(s.level)
  const lvlProg = Math.max(0, Math.min(1, (s.served - prev) / Math.max(1, next - prev)))
  return <header className="sim-topbar">
    <div className="sim-brand">
      <div className="sim-logo"><Pizza size={22} /></div>
      <div><b>Pizza Empire</b><small>TYCOON 2.0 · UNIDADE {String(s.franchises + 1).padStart(2, '0')}</small></div>
    </div>
    <div className="level-chip" title={`${s.served - prev}/${next - prev} pedidos para o próximo nível`}>
      <span>NÍVEL</span><b>{s.level}</b><i><em style={{ width: `${lvlProg * 100}%` }} /></i>
    </div>
    <div className="top-kpis">
      <Kpi icon={Wallet} label="SALDO" value={money(s.money)} className={s.money < 0 ? 'negative' : ''} sub={s.offlineEarned ? `+${money(s.offlineEarned)} offline` : null} />
      <Kpi icon={Users} label="CLIENTES" value={s.live.inside} sub={`${s.totals.customers} atendidos`} />
      <Kpi icon={ClipboardList} label="PEDIDOS" value={s.live.activeOrders} sub={`${s.live.baking} no forno · ${s.live.queue} na fila`} />
      <Kpi icon={Heart} label="SATISFAÇÃO" value={`${sat}%`} className={sat < 45 ? 'warn' : ''} />
      <Kpi icon={Star} label="REPUTAÇÃO" className="reputation" value={<>{'★'.repeat(stars)}<span>{'☆'.repeat(5 - stars)}</span></>} sub={`${s.reputation}/100`} />
      <Kpi icon={TrendingUp} label="FATURAMENTO HOJE" className="revenue" value={money(s.today.revenue + s.today.tips)} sub={`Total ${money(s.lifetime)}`} />
    </div>
    <div className="sim-controls">
      <div className="sim-date">{night ? <Moon size={13} /> : <Sun size={13} />} Dia {s.day} <span>{clockStr(s.clock)}</span></div>
      <div className="speed-controls">
        <button title="Pausar/continuar (Espaço)" className={s.paused ? 'chosen' : ''} onClick={s.togglePause}>{s.paused ? <Play size={13} /> : <Pause size={13} />}</button>
        {[1, 2, 4].map((n) => <button key={n} className={!s.paused && s.speed === n ? 'chosen' : ''} onClick={() => s.setSpeed(n)}>×{n}</button>)}
      </div>
    </div>
    <div className="profile-tools">
      <button title="Salvar" onClick={() => { s.save(); s.notify('Progresso salvo com sucesso!', 'success') }}><Save /></button>
      <button title="Configurações" onClick={() => s.setModal('settings')}><Settings /></button>
    </div>
  </header>
}
