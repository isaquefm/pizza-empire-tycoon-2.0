import React from 'react'
import { Target, Trophy, Newspaper, Keyboard, CheckCircle2, Circle, Gift } from 'lucide-react'
import { useGame } from '../../systems/store'
import { GOALS } from '../../data/goals'
import { SectionHead, clockStr, money } from '../ui'

export function BoardPanel() {
  const s = useGame()
  const done = GOALS.filter((g) => s.goalsDone[g.id]).length
  const next = GOALS.find((g) => !s.goalsDone[g.id])
  const claim = (g) => { if (s.claimGoal(g.id)) s.notify(`Prêmio resgatado: +${money(g.reward)}!`, 'success') }
  return <>
    <SectionHead kicker="AVISOS DA UNIDADE" title="Mural de gestão" />
    <div className="notice-card highlight"><Target /><div><b>Próxima meta</b><p>{next ? <>{next.text} · prêmio de {money(next.reward)}</> : 'Todas as metas concluídas. Seu império está consolidado!'}</p></div></div>
    <div className="info-card">
      <b><Trophy size={14} /> Metas ({done}/{GOALS.length})</b>
      <ul className="goal-list">{GOALS.map((g) => {
        const ok = !!s.goalsDone[g.id], claimed = !!s.goalsClaimed[g.id]
        return <li key={g.id} className={claimed ? 'ok' : ''}>
          {ok ? <CheckCircle2 size={14} className="tick" /> : <Circle size={14} />} <span>{g.text}</span>
          {ok && !claimed
            ? <button className="claim" onClick={() => claim(g)}><Gift size={11} /> {money(g.reward)}</button>
            : <em>{money(g.reward)}</em>}
        </li>
      })}</ul>
    </div>
    <div className="info-card">
      <b><Newspaper size={14} /> Atividades recentes</b>
      {s.log.length === 0 && <p className="muted">Nada por aqui ainda.</p>}
      <ul className="log-list">{s.log.slice(0, 14).map((n) => <li key={n.id} className={n.type}><em>D{n.day} {clockStr(n.clock)}</em> {n.text}</li>)}</ul>
    </div>
    <div className="info-card">
      <b><Keyboard size={14} /> Controles</b>
      <ul className="help-list">
        <li><kbd>Arrastar</kbd> mover a câmera · <kbd>Botão direito</kbd> girar</li>
        <li><kbd>Roda</kbd> zoom · <kbd>W A S D</kbd>/<kbd>setas</kbd> mover · <kbd>Q</kbd>/<kbd>E</kbd> girar</li>
        <li><kbd>Espaço</kbd> pausar · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> velocidade · <kbd>Clique</kbd> em um personagem para detalhes</li>
      </ul>
    </div>
  </>
}
