import React from 'react'
import { X, Save, Play, Pause, RotateCcw, Wrench, Paintbrush, Pizza, Monitor } from 'lucide-react'
import { useGame } from '../../systems/store'
import { THEMES } from '../../data/themes'
import { maintenanceCost } from '../../systems/Economy/economy'
import { money, Bar } from '../ui'

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
        s.notify(s.setTheme(key, id, t.cost) ? `${t.label}: ${o.name}.` : 'Saldo insuficiente.', 'info')
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
    <p className="muted">O progresso é salvo automaticamente neste navegador a cada 10 segundos.</p>
    <div className="modal-actions column">
      <button onClick={() => { s.save(); s.notify('Jogo salvo!', 'success'); close() }}><Save size={14} /> Salvar agora</button>
      <button className="secondary" onClick={() => { s.togglePause(); close() }}>{s.paused ? <><Play size={14} /> Retomar expediente</> : <><Pause size={14} /> Pausar expediente</>}</button>
      <button className="danger" onClick={() => { if (confirm('Apagar todo o progresso e iniciar uma nova pizzaria?')) { s.reset(); s.notify('Nova pizzaria iniciada. Boa sorte!', 'info'); close() } }}><RotateCcw size={14} /> Reiniciar jogo</button>
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
      <li>Ao fim de cada dia (22h) são pagos <b>salários e custos operacionais</b>. Fique de olho nas Finanças!</li>
    </ol>
    <div className="modal-actions"><button onClick={() => { s.markTutorial(); useGame.setState({ offlineEarned: 0 }); close() }}>Abrir a pizzaria!</button></div>
  </Modal>
}

export function Modals() {
  const modal = useGame((s) => s.modal)
  const close = () => useGame.getState().setModal(null)
  if (modal === 'edit') return <EditModal close={close} />
  if (modal === 'maintenance') return <MaintenanceModal close={close} />
  if (modal === 'settings') return <SettingsModal close={close} />
  if (modal === 'welcome') return <WelcomeModal close={close} />
  return null
}
