import React, { useEffect } from 'react'
import { ChefHat, UserPlus, GraduationCap, X, RefreshCw, Lock, Crown } from 'lucide-react'
import { useGame } from '../../systems/store'
import { ROLES, hireCost, trainCost, MAX_STAFF_LEVEL } from '../../data/staff'
import { maxStaff } from '../../systems/Economy/economy'
import { money, SectionHead, Bar } from '../ui'

const ROLE_COLORS = { owner: '#3a7fc4', chef: '#d8453a', waiter: '#2a2d36', cashier: '#e0883a', courier: '#c0392b' }

function Stat({ label, v }) {
  return <span className="stat-pill">{label} <b>{Math.round(v * 100)}%</b></span>
}

export function EmployeesPanel() {
  const s = useGame()
  const limit = maxStaff(s)
  useEffect(() => { if (s.unlocked.staff && !s.candidates.length) s.refreshCandidates() }, [s.unlocked.staff, s.candidates.length, s.day]) // eslint-disable-line
  const live = s.live.workers
  const hire = (c) => {
    if (s.staff.length >= limit) { s.notify(`Limite de ${limit} funcionários. Suba de nível ou amplie a pizzaria.`, 'warn'); return }
    if (s.hire(c.id)) s.notify(`${c.name} contratado(a) como ${ROLES[c.role].label}!`, 'success')
    else s.notify('Saldo insuficiente para contratar.', 'warn')
  }
  const payroll = s.staff.reduce((a, m) => a + m.salary, 0)
  return <>
    <SectionHead kicker="GESTÃO DE PESSOAS" title="Sua equipe" right={<span className="store-balance">{s.staff.length}/{limit}</span>} />
    <div className="team-summary"><div className="team-avatar"><ChefHat /></div><div><b>{s.staff.length} funcionário(s) contratado(s)</b><small>Folha diária: {money(payroll)} · paga no fechamento do dia</small></div></div>

    <div className="staff-list">
      <div className="staff-card owner">
        <i style={{ background: ROLE_COLORS.owner }}><Crown size={14} /></i>
        <div><b>Você <em>Gerente-proprietário</em></b><small>{live.owner?.label || 'Ocioso'}</small><Bar value={live.owner?.progress || 0} color="var(--blue)" height={4} /></div>
        <span className="muted">Faz todas as funções</span>
      </div>
      {s.staff.map((m) => {
        const w = live[m.id]
        return <div className="staff-card" key={m.id}>
          <i style={{ background: ROLE_COLORS[m.role] }}>{m.name[0]}</i>
          <div>
            <b>{m.name} <em>{ROLES[m.role].label} · Nv {m.level}</em></b>
            <small>{w?.label || 'Chegando ao trabalho'}</small>
            <Bar value={w?.progress || 0} color="var(--blue)" height={4} />
            <div className="stat-row"><Stat label="Velocidade" v={m.speed} /><Stat label="Eficiência" v={m.eff} /><span className="stat-pill">Salário <b>{money(m.salary)}</b></span></div>
          </div>
          <div className="staff-actions">
            <button title={m.level >= MAX_STAFF_LEVEL ? 'Nível máximo' : `Treinar (${money(trainCost(m))})`} disabled={m.level >= MAX_STAFF_LEVEL} onClick={() => s.notify(s.train(m.id) ? `${m.name} concluiu o treinamento!` : 'Saldo insuficiente para o treinamento.', 'info')}><GraduationCap size={14} />{m.level < MAX_STAFF_LEVEL && <small>{money(trainCost(m))}</small>}</button>
            <button title="Demitir" className="danger" onClick={() => { if (confirm(`Demitir ${m.name}?`)) { s.fire(m.id); s.notify(`${m.name} foi desligado(a).`, 'info') } }}><X size={14} /></button>
          </div>
        </div>
      })}
    </div>

    <div className="section-heading sub"><div><small>RECRUTAMENTO</small><b>Candidatos disponíveis</b></div>
      {s.unlocked.staff && <button className="ghost" title="Novos candidatos" onClick={() => s.refreshCandidates()}><RefreshCw size={13} /></button>}</div>
    {!s.unlocked.staff
      ? <div className="info-card locked-card"><Lock size={16} /><p>A contratação é liberada no <b>nível 2</b> (8 pedidos entregues). Até lá, você cuida de tudo sozinho!</p></div>
      : <div className="candidate-list">
        <p className="muted">Custo de contratação: <b>{money(hireCost(s.staff.length))}</b> (aumenta a cada contratação).</p>
        {s.candidates.map((c) => <div className="candidate" key={c.id}>
          <i style={{ background: ROLE_COLORS[c.role] }}>{c.name[0]}</i>
          <div><b>{c.name}</b><small>{ROLES[c.role].label} — {ROLES[c.role].desc}</small>
            <div className="stat-row"><Stat label="Vel." v={c.speed} /><Stat label="Efic." v={c.eff} /><span className="stat-pill">Salário <b>{money(c.salary)}</b>/dia</span></div></div>
          <button onClick={() => hire(c)}><UserPlus size={13} /> Contratar</button>
        </div>)}
        {s.level < ROLES.courier.level && <p className="muted"><Lock size={11} /> Entregadores (delivery) liberam no nível {ROLES.courier.level}.</p>}
      </div>}
  </>
}
