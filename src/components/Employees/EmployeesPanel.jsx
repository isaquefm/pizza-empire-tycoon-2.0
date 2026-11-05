import React, { useEffect } from 'react'
import { ChefHat, UserPlus, GraduationCap, X, RefreshCw, Lock, Crown, Sparkles } from 'lucide-react'
import { useGame } from '../../systems/store'
import { ROLES, hireCost, severanceCost, rerollCost, trainCost, MAX_STAFF_LEVEL, rarityOf, perkText } from '../../data/staff'
import { maxStaff } from '../../systems/Economy/economy'
import { sfx } from '../../systems/audio'
import { money, SectionHead, Bar } from '../ui'

const ROLE_COLORS = { owner: '#3a7fc4', chef: '#d8453a', waiter: '#2a2d36', cashier: '#e0883a', courier: '#c0392b' }

function Stat({ label, v }) {
  return <span className="stat-pill">{label} <b>{Math.round(v * 100)}%</b></span>
}

function RarityBadge({ member }) {
  const r = rarityOf(member)
  return <span className="rarity" style={{ color: r.color, borderColor: r.color }}>{r.tier === 3 && <Sparkles size={9} />}{r.label}</span>
}

export function EmployeesPanel() {
  const s = useGame()
  const limit = maxStaff(s)
  useEffect(() => { s.ensureCandidates() }, [s.unlocked.staff, s.day]) // eslint-disable-line
  const live = s.live.workers
  const full = s.staff.length >= limit

  const hire = (c) => {
    if (full) { s.notify(`Limite de ${limit} funcionários. Suba de nível ou amplie a pizzaria.`, 'warn'); return }
    if (s.hire(c.id)) {
      sfx(rarityOf(c).tier >= 2 ? 'star' : 'hire')
      s.notify(`${c.name} contratado(a) como ${ROLES[c.role].label}!`, 'success')
    } else s.notify('Saldo insuficiente para contratar.', 'warn')
  }
  const reroll = () => {
    const cost = rerollCost(s.level, s.rerolls)
    if (s.rerollCandidates()) { sfx('click'); s.notify(`Novos candidatos encontrados por ${money(cost)}.`, 'info') }
    else s.notify(`Faltam ${money(cost - s.money)} para buscar novos candidatos.`, 'warn')
  }
  const fire = (m) => s.ask({
    title: `Demitir ${m.name}?`,
    text: `A rescisão custa ${money(severanceCost(m))} (dois dias de salário) e é cobrada mesmo sem saldo. O salário diário de ${money(m.salary)} deixa de ser pago.`,
    confirmLabel: `Demitir · ${money(severanceCost(m))}`,
    danger: true,
    onConfirm: () => { s.fire(m.id); s.notify(`${m.name} foi desligado(a).`, 'info') },
  })

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
        const perk = perkText(m)
        return <div className="staff-card" key={m.id}>
          <i style={{ background: ROLE_COLORS[m.role] }}>{m.name[0]}</i>
          <div>
            <b>{m.name} <em>{ROLES[m.role].label} · Nv {m.level}</em></b>
            <RarityBadge member={m} />
            <small>{w?.label || 'Chegando ao trabalho'}</small>
            <Bar value={w?.progress || 0} color="var(--blue)" height={4} />
            <div className="stat-row"><Stat label="Velocidade" v={m.speed} /><Stat label="Eficiência" v={m.eff} /><span className="stat-pill">Salário <b>{money(m.salary)}</b></span></div>
            {perk && <small className="perk">✦ {perk}</small>}
          </div>
          <div className="staff-actions">
            <button title={m.level >= MAX_STAFF_LEVEL ? 'Nível máximo' : `Treinar (${money(trainCost(m))})`} disabled={m.level >= MAX_STAFF_LEVEL} onClick={() => { const ok = s.train(m.id); if (ok) sfx('upgrade'); s.notify(ok ? `${m.name} concluiu o treinamento!` : 'Saldo insuficiente para o treinamento.', ok ? 'success' : 'warn') }}><GraduationCap size={14} />{m.level < MAX_STAFF_LEVEL && <small>{money(trainCost(m))}</small>}</button>
            <button title={`Demitir (rescisão de ${money(severanceCost(m))})`} className="danger" onClick={() => fire(m)}><X size={14} /></button>
          </div>
        </div>
      })}
    </div>

    <div className="section-heading sub"><div><small>RECRUTAMENTO</small><b>Candidatos do dia</b></div>
      {s.unlocked.staff && <button className="ghost" title="Buscar outros candidatos agora (a lista também renova de graça a cada dia)" onClick={reroll}><RefreshCw size={13} /> {money(rerollCost(s.level, s.rerolls))}</button>}</div>
    {!s.unlocked.staff
      ? <div className="info-card locked-card"><Lock size={16} /><p>A contratação é liberada no <b>nível 2</b> (8 pedidos entregues). Até lá, você cuida de tudo sozinho!</p></div>
      : <div className="candidate-list">
        <p className="muted">Cada candidato tem seu preço: depende do cargo e da raridade, e sobe 10% por funcionário na equipe. A lista renova de graça a cada dia.</p>
        {s.candidates.map((c) => {
          const cost = hireCost(c, s.staff.length), poor = s.money < cost, perk = perkText(c), r = rarityOf(c)
          return <div className={`candidate rarity-${c.rarity || 'comum'}`} key={c.id} style={{ borderColor: r.tier ? r.color : undefined }}>
            <div className="candidate-top">
              <i style={{ background: ROLE_COLORS[c.role] }}>{c.name[0]}</i>
              <div><b>{c.name} <RarityBadge member={c} /></b><small>{ROLES[c.role].label} — {ROLES[c.role].desc}</small></div>
            </div>
            <div className="stat-row"><Stat label="Vel." v={c.speed} /><Stat label="Efic." v={c.eff} /><span className="stat-pill">Salário <b>{money(c.salary)}</b>/dia</span></div>
            {perk && <small className="perk">✦ {perk}</small>}
            <div className="product-buy">
              <div className="price-box"><b>{money(cost)}</b>{poor && <small>Faltam {money(cost - s.money)}</small>}</div>
              <button className={poor || full ? 'poor' : ''} onClick={() => hire(c)}><UserPlus size={13} /> Contratar</button>
            </div>
          </div>
        })}
        {!s.candidates.length && <p className="muted empty-note">Você contratou todos os candidatos de hoje. Novos chegam amanhã.</p>}
        {s.level < ROLES.courier.level && <p className="muted"><Lock size={11} /> Entregadores (delivery) liberam no nível {ROLES.courier.level} e aparecem na renovação seguinte da lista.</p>}
      </div>}
  </>
}
