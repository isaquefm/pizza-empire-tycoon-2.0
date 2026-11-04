import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useGame } from '../../systems/store'
import { getEntity, CUSTOMER_STATE_LABEL } from '../../systems/simulation'
import { recipeById } from '../../data/recipes'
import { ROLES } from '../../data/staff'
import { money, Bar, patienceColor } from '../ui'

const MOOD = { happy: 'Feliz', neutral: 'Neutro', impatient: 'Impaciente', angry: 'Irritado' }

export function SelectionCard() {
  const selected = useGame((s) => s.selected)
  const [info, setInfo] = useState(null)
  useEffect(() => {
    if (!selected) { setInfo(null); return }
    const read = () => {
      const e = getEntity(selected)
      if (!e) { setInfo(null); useGame.getState().select(null); return }
      setInfo(e.kind === 'customer'
        ? { kind: 'customer', name: e.name, state: CUSTOMER_STATE_LABEL[e.state] || e.state, mood: MOOD[e.mood] || '—', patience: e.patience, recipe: recipeById(e.recipe).name, price: e.price, money: e.money, sat: e.sat, takeaway: e.takeaway }
        : { kind: 'worker', name: e.name, role: e.role === 'owner' ? 'Gerente-proprietário' : ROLES[e.role]?.label, label: e.label, progress: e.progress || 0, level: e.member?.level, speed: e.member?.speed, eff: e.member?.eff, salary: e.member?.salary })
    }
    read()
    const id = setInterval(read, 250)
    return () => clearInterval(id)
  }, [selected])
  if (!info) return null
  return <div className="selection-card">
    <button className="close" onClick={() => useGame.getState().select(null)}><X size={14} /></button>
    <small>{info.kind === 'customer' ? 'CLIENTE' : 'FUNCIONÁRIO'}</small>
    <b>{info.name}</b>
    {info.kind === 'customer' ? <>
      <p>{info.state} · {info.mood}</p>
      <div className="sel-row"><span>Pedido</span><b>{info.recipe}{info.takeaway ? ' (viagem)' : ''}</b></div>
      <div className="sel-row"><span>Valor</span><b>{money(info.price)}</b></div>
      <div className="sel-row"><span>Dinheiro disponível</span><b>{money(info.money)}</b></div>
      {info.sat != null && <div className="sel-row"><span>Satisfação final</span><b>{info.sat}%</b></div>}
      <span className="sel-label">Paciência</span><Bar value={info.patience} color={patienceColor(info.patience)} />
    </> : <>
      <p>{info.role}{info.level ? ` · Nível ${info.level}` : ''}</p>
      <div className="sel-row"><span>Atividade</span><b>{info.label}</b></div>
      {info.salary ? <div className="sel-row"><span>Salário</span><b>{money(info.salary)}/dia</b></div> : null}
      {info.speed ? <div className="sel-row"><span>Velocidade · Eficiência</span><b>{Math.round(info.speed * 100)}% · {Math.round(info.eff * 100)}%</b></div> : null}
      <span className="sel-label">Progresso da tarefa</span><Bar value={info.progress} color="var(--blue)" />
    </>}
  </div>
}
