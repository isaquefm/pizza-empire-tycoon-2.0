import React from 'react'
import { Target, Trophy, Newspaper, Keyboard, CheckCircle2, Circle } from 'lucide-react'
import { useGame, satisfactionOf } from '../../systems/store'
import { SectionHead, clockStr } from '../ui'

// Metas de progressão (calculadas a partir do estado real do jogo)
const GOALS = [
  { id: 'first', text: 'Entregue o primeiro pedido', done: (s) => s.totals.pizzas >= 1 },
  { id: 'lvl2', text: 'Alcance o nível 2 e contrate o primeiro funcionário', done: (s) => s.level >= 2 && s.staff.length > 0 },
  { id: 'decor', text: 'Compre 3 itens na loja', done: (s) => Object.keys(s.owned).length >= 3 },
  { id: 'tables', text: 'Tenha 6 mesas no salão', done: (s) => s.tables >= 6 },
  { id: 'recipe', text: 'Libere uma nova receita', done: (s) => s.recipes.length >= 2 },
  { id: 'oven2', text: 'Instale o segundo forno', done: (s) => !!s.owned.oven2 },
  { id: 'delivery', text: 'Contrate um entregador e faça 5 entregas', done: (s) => s.totals.deliveries >= 5 },
  { id: 'sat', text: 'Mantenha a satisfação acima de 85%', done: (s) => s.satHistory.length >= 10 && satisfactionOf(s) >= 85 },
  { id: 'terrace', text: 'Construa a varanda externa', done: (s) => !!s.expansions.terrace },
  { id: 'rich', text: 'Fature R$ 10.000 no total', done: (s) => s.lifetime >= 10000 },
  { id: 'franchise', text: 'Abra a segunda unidade (franquia)', done: (s) => s.franchises >= 1 },
]

export function BoardPanel() {
  const s = useGame()
  const done = GOALS.filter((g) => g.done(s)).length
  const next = GOALS.find((g) => !g.done(s))
  return <>
    <SectionHead kicker="AVISOS DA UNIDADE" title="Mural de gestão" />
    <div className="notice-card highlight"><Target /><div><b>Próxima meta</b><p>{next ? next.text : 'Todas as metas concluídas — seu império está consolidado!'}</p></div></div>
    <div className="info-card">
      <b><Trophy size={14} /> Metas ({done}/{GOALS.length})</b>
      <ul className="goal-list">{GOALS.map((g) => { const ok = g.done(s); return <li key={g.id} className={ok ? 'ok' : ''}>{ok ? <CheckCircle2 size={14} /> : <Circle size={14} />} {g.text}</li> })}</ul>
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
