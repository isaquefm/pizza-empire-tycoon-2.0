import React from 'react'
import { Paintbrush, Wrench, Hammer, Expand, ArrowUp, Pizza, Flame } from 'lucide-react'
import { useGame } from '../../systems/store'
import { expandCost, maxTables, maintenanceCost, reformCost, MAX_REFORM } from '../../systems/Economy/economy'
import { kitchenBoost } from '../../systems/simulation'
import { sfx } from '../../systems/audio'
import { money } from '../ui'

export function BottomBar() {
  const s = useGame()
  const L = s.live
  const full = s.tables + 2 > maxTables(s)
  const maint = maintenanceCost(s)
  const ampliar = () => {
    if (full) { useGame.setState({ tab: 'Melhorias' }); s.notify('Salão no limite. Veja as ampliações em Melhorias.', 'info'); return }
    const ok = s.expand()
    if (ok) sfx('upgrade')
    s.notify(ok ? 'Salão ampliado! +2 mesas.' : 'Saldo insuficiente para ampliar.', ok ? 'success' : 'warn')
  }
  const reformar = () => {
    if (s.reformLevel >= MAX_REFORM) { s.notify('A reforma já está completa.', 'info'); return }
    const ok = s.reform()
    s.notify(ok ? `Reforma nível ${s.reformLevel + 1} concluída! +5 conforto.` : 'Saldo insuficiente para reformar.', ok ? 'success' : 'warn')
  }
  const melhorar = () => {
    const r = s.upgradeAll()
    s.notify(r.bought ? `${r.bought} melhoria(s) aplicada(s) por ${money(r.spent)}.` : 'Nenhuma melhoria cabe no saldo atual.', r.bought ? 'success' : 'warn')
  }
  const help = () => {
    if (s.paused) { s.notify('Retome o expediente para ajudar na cozinha.', 'warn'); return }
    if (kitchenBoost()) s.notify('Você deu uma força na cozinha! Preparo e forno acelerados.', 'info')
  }
  return <div className="map-bottom">
    <div className="queue-summary">
      <div className="queue-icon"><Pizza /></div>
      <div><small>PEDIDOS EM ANDAMENTO</small><b>{L.activeOrders} <em>{L.queued} aguardando · {L.preparing} em preparo · {L.baking} no forno · {L.ready} prontos{L.deliveriesOut ? ` · ${L.deliveriesOut} em rota` : ''}</em></b></div>
    </div>
    <div className="map-actions">
      <button onClick={() => s.setModal('edit')}><Paintbrush /> Editar</button>
      <button onClick={() => s.setModal('maintenance')} className={s.condition < 50 ? 'alert' : ''}><Wrench /> Manutenção {maint > 0 && <small>{Math.round(s.condition)}%</small>}</button>
      <button onClick={reformar} disabled={s.reformLevel >= MAX_REFORM}><Hammer /> Reformar {s.reformLevel < MAX_REFORM && <small>{money(reformCost(s.reformLevel))}</small>}</button>
      <button onClick={ampliar}><Expand /> Ampliar {!full && <small>{money(expandCost(s.tables))}</small>}</button>
      <button className="upgrade-all" onClick={melhorar}><ArrowUp /> Melhorar tudo</button>
    </div>
    <button className="serve-fab" onClick={help} title="Acelera preparo e forno por alguns segundos"><Flame size={16} /> AJUDAR NA COZINHA</button>
  </div>
}
