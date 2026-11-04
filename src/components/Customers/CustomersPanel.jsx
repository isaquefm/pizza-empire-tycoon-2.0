import React from 'react'
import { Heart, Smile, Meh, Frown } from 'lucide-react'
import { useGame, satisfactionOf, starsOf } from '../../systems/store'
import { getModifiers } from '../../systems/Economy/economy'
import { CUSTOMER_STATE_LABEL } from '../../systems/simulation'
import { recipeById } from '../../data/recipes'
import { money, SectionHead, Row, Bar, patienceColor } from '../ui'

const MoodIcon = ({ mood }) => mood === 'happy' ? <Smile size={15} className="mood happy" /> : mood === 'neutral' ? <Meh size={15} className="mood neutral" /> : <Frown size={15} className="mood bad" />

export function CustomersPanel() {
  const s = useGame()
  const sat = satisfactionOf(s)
  const m = getModifiers(s)
  const L = s.live
  return <>
    <SectionHead kicker="RELACIONAMENTO" title="Experiência dos clientes" />
    <div className="customer-score"><Heart /><strong>{sat}%</strong><span>Satisfação média · {starsOf(s)}★ · reputação {s.reputation}/100</span></div>
    <div className="overview-grid compact">
      <div><b>{L.inside}</b><small>No restaurante</small></div>
      <div><b>{L.queue}</b><small>Na fila do caixa</small></div>
      <div><b>{L.waitingFood}</b><small>Aguardando pizza</small></div>
      <div><b>{s.today.lost}</b><small>Desistiram hoje</small></div>
    </div>
    <div className="info-card">
      <b>Clientes agora</b>
      {L.customers.length === 0 && <p className="muted">Nenhum cliente no momento.</p>}
      <div className="customer-list">{L.customers.map((c) => <button key={c.id} className={`customer-row ${s.selected === c.id ? 'on' : ''}`} onClick={() => s.select(c.id)}>
        <MoodIcon mood={c.mood} />
        <div><b>{c.name}</b><small>{CUSTOMER_STATE_LABEL[c.state] || c.state} · {recipeById(c.recipe).name}{c.takeaway ? ' (viagem)' : ''}</small>
          <Bar value={c.patience} color={patienceColor(c.patience)} height={4} /></div>
        <span>{money(c.price)}</span>
      </button>)}</div>
    </div>
    <div className="info-card">
      <b>Fatores de satisfação</b>
      <Row label="Conforto do ambiente" value={`+${m.comfort}`} />
      <Row label="Qualidade (forno nível)" value={`+${Math.min(12, s.ovenLevel * 2)}`} />
      <Row label="Paciência dos clientes" value={`${Math.round(m.patience * 100)}%`} />
      <Row label="Atratividade (movimento)" value={`${Math.round(m.attraction * 100)}%`} />
      <Row label="Total atendidos · perdidos" value={`${s.totals.customers} · ${s.totals.lost}`} />
      <p>Clientes satisfeitos (≥75%) aumentam a reputação e dão gorjeta; quem desiste derruba 3 pontos. Invista em conforto, decoração e equipe para reduzir a espera.</p>
    </div>
  </>
}
