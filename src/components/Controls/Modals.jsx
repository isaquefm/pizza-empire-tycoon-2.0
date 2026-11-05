import React from 'react'
import { X, Save, Play, Pause, RotateCcw, Wrench, Paintbrush, Pizza, Monitor, Moon, Skull } from 'lucide-react'
import { useGame, BANKRUPT_DAYS } from '../../systems/store'
import { THEMES } from '../../data/themes'
import { recipeById } from '../../data/recipes'
import { eventById } from '../../data/events'
import { maintenanceCost } from '../../systems/Economy/economy'
import { sfx } from '../../systems/audio'
import { money, Bar, Row } from '../ui'

function Modal({ title, icon: Icon, children, onClose, wide }) {
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
    <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
      <div className="modal-head">{Icon && <Icon size={18} />}<b>{title}</b><button onClick={onClose} aria-label="Fechar"><X size={16} /></button></div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
}

function EditModal({ close }) {
  const s = useGame()
  return <Modal title="Personalizar pizzaria" icon={Paintbrush} onClose={close} wide>
    <p className="muted">Escolha cores e acabamentos. As mudanças aparecem imediatamente no cenário 3D.</p>
    {Object.entries(THEMES).map(([key, t]) => <div key={key} className="theme-group">
      <b>{t.label} <small>{money(t.cost)} por troca</small></b>
      <div className="swatches">{Object.entries(t.options).map(([id, o]) => <button key={id} className={s.theme[key] === id ? 'on' : ''} onClick={() => {
        if (s.theme[key] === id) return
        const ok = s.setTheme(key, id, t.cost)
        s.notify(ok ? `${t.label}: ${o.name}.` : 'Saldo insuficiente.', ok ? 'info' : 'warn')
      }}><i style={{ background: o.color }} />{o.name}</button>)}</div>
    </div>)}
  </Modal>
}

function MaintenanceModal({ close }) {
  const s = useGame()
  const cost = maintenanceCost(s)
  return <Modal title="Manutenção dos equipamentos" icon={Wrench} onClose={close}>
    <p>Fornos, bancadas e geladeiras se desgastam com o uso (cada pizza assada e cada dia de operação).</p>
    <Bar value={s.condition / 100} color={s.condition > 50 ? 'var(--green)' : s.condition > 25 ? 'var(--amber)' : 'var(--red)'} height={10} />
    <p><b>{Math.round(s.condition)}%</b> de conservação. Abaixo de 50% o preparo fica 20% mais lento; abaixo de 25%, 45% mais lento e a satisfação cai.</p>
    <div className="modal-actions">
      <button className="secondary" onClick={close}>Agora não</button>
      <button disabled={cost <= 0} onClick={() => { const r = s.maintain(); s.notify(r === true ? 'Manutenção concluída! Equipamentos 100%.' : 'Saldo insuficiente.', r === true ? 'success' : 'warn'); if (r === true) close() }}>{cost > 0 ? `Realizar manutenção · ${money(cost)}` : 'Tudo em ordem'}</button>
    </div>
  </Modal>
}

function SettingsModal({ close }) {
  const s = useGame()
  return <Modal title="Configurações" icon={Monitor} onClose={close}>
    <div className="theme-group"><b>Qualidade gráfica</b>
      <div className="swatches">{[['alta', 'Alta'], ['media', 'Média'], ['baixa', 'Baixa']].map(([k, n]) => <button key={k} className={s.settings.quality === k ? 'on' : ''} onClick={() => s.setSetting('quality', k)}>{n}</button>)}</div>
      <small className="muted">Alta: sombras detalhadas e até 30 clientes. Baixa: sem sombras projetadas, ideal para computadores modestos.</small>
    </div>
    <div className="theme-group"><b>Som</b>
      <label className="slider"><span>Efeitos</span><input type="range" min="0" max="1" step="0.05" value={s.settings.sfx} onChange={(e) => s.setSetting('sfx', +e.target.value)} onPointerUp={() => sfx('click')} /></label>
      <label className="slider"><span>Música</span><input type="range" min="0" max="1" step="0.05" value={s.settings.music} onChange={(e) => s.setSetting('music', +e.target.value)} /></label>
    </div>
    <label className="check"><input type="checkbox" checked={s.settings.daySummary} onChange={(e) => s.setSetting('daySummary', e.target.checked)} /> Mostrar o resumo ao fechar cada dia</label>
    <p className="muted">O progresso é salvo automaticamente neste navegador a cada 10 segundos.</p>
    <div className="modal-actions column">
      <button onClick={() => { s.save(); s.notify('Jogo salvo!', 'success'); close() }}><Save size={14} /> Salvar agora</button>
      <button className="secondary" onClick={() => { s.togglePause(); close() }}>{s.paused ? <><Play size={14} /> Retomar expediente</> : <><Pause size={14} /> Pausar expediente</>}</button>
      <button className="danger" onClick={() => s.ask({
        title: 'Reiniciar o jogo?',
        text: 'Todo o progresso será apagado e uma nova pizzaria será iniciada. Não é possível desfazer.',
        confirmLabel: 'Apagar e reiniciar',
        danger: true,
        onConfirm: () => { s.reset(); s.notify('Nova pizzaria iniciada. Boa sorte!', 'info') },
      })}><RotateCcw size={14} /> Reiniciar jogo</button>
    </div>
  </Modal>
}

function WelcomeModal({ close }) {
  const s = useGame()
  return <Modal title="Bem-vindo ao Pizza Empire Tycoon 2.0" icon={Pizza} onClose={() => { s.markTutorial(); close() }} wide>
    {s.offlineEarned > 0 && <div className="offline-box">Sua equipe trabalhou enquanto você esteve fora: <b>+{money(s.offlineEarned)}</b></div>}
    <ol className="tutorial">
      <li><b>Clientes chegam sozinhos</b>: fazem o pedido no caixa, sentam, comem, pagam e vão embora.</li>
      <li><b>Você é o gerente</b>: no começo faz tudo sozinho. Use <em>Ajudar na cozinha</em> para acelerar.</li>
      <li><b>Nível 2</b> (8 pedidos): contrate pizzaiolos, garçons e caixas na aba <em>Equipe</em>.</li>
      <li><b>Loja e Melhorias</b>: equipamentos aceleram a produção; conforto e decoração aumentam a satisfação.</li>
      <li><b>Câmera</b>: arraste para mover, botão direito para girar, roda para zoom (ou WASD, Q/E).</li>
      <li>Ao fim de cada dia (22h) são pagos <b>salários e custos operacionais</b>. Fechar {BANKRUPT_DAYS} dias seguidos no vermelho leva à <b>falência</b>!</li>
      <li>Fique atento aos <b>eventos do dia</b> e resgate os prêmios das metas no <em>Mural</em>.</li>
    </ol>
    <div className="modal-actions"><button onClick={() => { s.markTutorial(); useGame.setState({ offlineEarned: 0 }); close() }}>Abrir a pizzaria!</button></div>
  </Modal>
}

// Dicas do resumo, a partir do que aconteceu no dia
function dayTips(sum) {
  const r = sum.record, tips = []
  if (r.lost >= 3) tips.push('Muitos clientes desistiram: reforce a equipe ou compre itens de paciência.')
  if (r.profit < 0) tips.push('O dia fechou no prejuízo: reveja salários e custos em Finanças.')
  if (sum.satisfaction < 60) tips.push('Satisfação baixa: itens de conforto e decoração ajudam, e rendem gorjetas.')
  if (sum.condition < 50) tips.push('Equipamentos desgastados deixam tudo mais lento: faça a manutenção.')
  if (!tips.length) tips.push(r.served > 0 ? 'Dia tranquilo! Que tal investir o lucro em algo novo na Loja?' : 'Nenhum pedido hoje: invista em atrair clientes.')
  return tips
}

function DaySummaryModal({ close }) {
  const sum = useGame((s) => s.lastSummary)
  if (!sum) return null
  const r = sum.record
  const finished = eventById(sum.finishedEvent), next = eventById(sum.nextEvent)
  return <Modal title={`Fechamento do dia ${r.day}`} icon={Moon} onClose={close}>
    <div className={`summary-hero ${r.profit >= 0 ? 'pos' : 'neg'}`}><small>RESULTADO DO DIA</small><strong>{money(r.profit)}</strong><span>Saldo em caixa: {money(sum.money)}</span></div>
    <div className="info-card">
      <Row label="Vendas e gorjetas" value={money(r.revenue + r.tips)} tone="pos" />
      <Row label="Ingredientes" value={`− ${money(r.ingredients)}`} tone="neg" />
      <Row label="Salários e rescisões" value={`− ${money(r.salaries)}`} tone="neg" />
      <Row label="Custos operacionais" value={`− ${money(r.operating)}`} tone="neg" />
      {r.maintenance > 0 && <Row label="Manutenção" value={`− ${money(r.maintenance)}`} tone="neg" />}
      {r.purchases > 0 && <Row label="Investimentos (fora do resultado)" value={money(r.purchases)} />}
    </div>
    <div className="overview-grid compact">
      <div><b>{r.served}</b><small>Pedidos ({r.deliveries} delivery)</small></div>
      <div><b>{r.lost}</b><small>Clientes perdidos</small></div>
      <div><b>{sum.satisfaction}%</b><small>Satisfação</small></div>
      <div><b>{sum.topRecipe ? recipeById(sum.topRecipe).name : '—'}</b><small>Pizza mais pedida</small></div>
    </div>
    {finished?.critic && <div className={`event-box ${sum.criticDelta > 0 ? 'good' : 'bad'}`}><b>Veredito do crítico</b><p>{sum.criticDelta > 0 ? `Elogios na coluna do jornal! Reputação +${sum.criticDelta}.` : `Crítica dura no jornal. Reputação ${sum.criticDelta}.`}</p></div>}
    {sum.debtDays > 0 && <div className="event-box bad"><b>Saldo negativo: {sum.debtDays}/{BANKRUPT_DAYS}</b><p>Se o caixa fechar no vermelho {BANKRUPT_DAYS} dias seguidos, a pizzaria vai à falência. Corte custos ou aumente as vendas!</p></div>}
    <ul className="summary-tips">{dayTips(sum).map((t) => <li key={t}>{t}</li>)}</ul>
    {next && <div className={`event-box ${next.tone}`}><b>Amanhã: {next.name}</b><p>{next.desc}</p></div>}
    <div className="modal-actions"><button onClick={close}>Abrir o dia {r.day + 1}</button></div>
  </Modal>
}

function BankruptModal() {
  const s = useGame()
  return <div className="modal-backdrop">
    <div className="modal" role="alertdialog" aria-modal="true">
      <div className="modal-head"><Skull size={18} /><b>A pizzaria faliu</b></div>
      <div className="modal-body">
        <p>Depois de {BANKRUPT_DAYS} dias seguidos no vermelho, os credores fecharam as portas. Fim de jogo.</p>
        <div className="overview-grid compact">
          <div><b>{s.day - 1}</b><small>Dias de operação</small></div>
          <div><b>{s.totals.pizzas}</b><small>Pizzas vendidas</small></div>
          <div><b>{money(s.lifetime)}</b><small>Faturamento total</small></div>
          <div><b>{s.franchises + 1}</b><small>Unidades abertas</small></div>
        </div>
        <div className="modal-actions"><button onClick={() => { s.reset(); s.notify('Nova pizzaria iniciada. Boa sorte!', 'info') }}><RotateCcw size={14} /> Começar de novo</button></div>
      </div>
    </div>
  </div>
}

function ConfirmBox({ box }) {
  const closeAsk = useGame((s) => s.closeAsk)
  return <div className="modal-backdrop top" onMouseDown={(e) => { if (e.target === e.currentTarget) closeAsk() }}>
    <div className="modal" role="alertdialog" aria-modal="true">
      <div className="modal-head"><b>{box.title}</b></div>
      <div className="modal-body">
        <p>{box.text}</p>
        <div className="modal-actions">
          <button className="secondary" onClick={closeAsk}>Cancelar</button>
          <button className={box.danger ? 'danger' : ''} onClick={() => { closeAsk(); box.onConfirm() }}>{box.confirmLabel || 'Confirmar'}</button>
        </div>
      </div>
    </div>
  </div>
}

export function Modals() {
  const modal = useGame((s) => s.modal)
  const box = useGame((s) => s.confirmBox)
  const close = () => useGame.getState().setModal(null)
  return <>
    {modal === 'edit' && <EditModal close={close} />}
    {modal === 'maintenance' && <MaintenanceModal close={close} />}
    {modal === 'settings' && <SettingsModal close={close} />}
    {modal === 'welcome' && <WelcomeModal close={close} />}
    {modal === 'daySummary' && <DaySummaryModal close={close} />}
    {modal === 'bankrupt' && <BankruptModal />}
    {box && <ConfirmBox box={box} />}
  </>
}
