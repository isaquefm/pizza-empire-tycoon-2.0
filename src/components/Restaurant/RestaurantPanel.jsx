import React from 'react'
import { Utensils, Flame, Pizza, Star, Armchair, Wrench, Hammer, Eye, ChefHat } from 'lucide-react'
import { useGame } from '../../systems/store'
import { getModifiers, expandCost, maxTables, maintenanceCost, reformCost, MAX_REFORM } from '../../systems/Economy/economy'
import { recipeById } from '../../data/recipes'
import { ORDER_LABEL } from '../../systems/Orders/orders'
import { money, SectionHead, Row, Bar } from '../ui'

export function RestaurantPanel() {
  const s = useGame()
  const m = getModifiers(s)
  const cap = maxTables(s)
  const canExpand = s.tables + 2 <= cap
  const maint = maintenanceCost(s)
  const L = s.live
  const expand = () => {
    if (!canExpand) { s.notify(s.expansions.terrace ? 'O salão e a varanda estão completos.' : 'Salão lotado! Construa a Varanda externa (Melhorias) para mais mesas.', 'warn'); return }
    if (s.expand()) s.notify(`Salão ampliado! +2 mesas (${s.tables + 2} no total).`, 'success')
    else s.notify('Saldo insuficiente para ampliar o salão.', 'warn')
  }
  return <>
    <SectionHead kicker="OPERAÇÃO E ESTRUTURA" title="Seu restaurante" />
    <div className="overview-grid">
      <div><Utensils /><b>{s.tables}<small>/{cap}</small></b><small>Mesas ({L.seats} lugares)</small></div>
      <div><Flame /><b>{m.ovens}× · Nv {s.ovenLevel}</b><small>Fornos ({m.ovenSlots} vagas)</small></div>
      <div><ChefHat /><b>{m.prepStations}</b><small>Bancadas de preparo</small></div>
      <div><Star /><b>Nível {s.level}</b><small>{s.served} pedidos na unidade</small></div>
    </div>
    <div className="info-card">
      <b>Operação ao vivo</b>
      <div className="pipeline">
        {[['Fila', L.queued], ['Preparo', L.preparing], ['Forno', L.baking], ['Retirada', L.ready]].map(([k, v]) => <div key={k}><b>{v}</b><small>{k}</small></div>)}
      </div>
      <Row label="Lugares livres" value={`${L.seatsFree}/${L.seats}`} />
      <Row label="Mesas para limpar" value={L.dirty} tone={L.dirty > 2 ? 'warn' : ''} />
      <Row label="Forno ocupado" value={`${L.ovenBusy}/${L.ovenSlots}`} />
      {L.orders.length > 0 && <div className="order-chips">{L.orders.map((o) => <span key={o.id} className={`chip st-${o.status}`}>{o.delivery ? '🛵 ' : ''}{recipeById(o.recipe).name} · {ORDER_LABEL[o.status]}{o.status === 'baking' ? ` ${Math.round(o.bake * 100)}%` : ''}</span>)}</div>}
    </div>
    <div className="info-card">
      <b><Armchair size={14} /> Capacidade do salão</b>
      <p>Cada ampliação adiciona 2 mesas (4 lugares). {s.expansions.terrace ? 'A varanda externa comporta até 6 mesas extras.' : 'O salão interno comporta até 10 mesas.'}</p>
      <button onClick={expand} disabled={!canExpand}>{canExpand ? `Ampliar salão · ${money(expandCost(s.tables))}` : 'Capacidade máxima'}</button>
    </div>
    <div className="info-card">
      <b><Wrench size={14} /> Conservação dos equipamentos</b>
      <Bar value={s.condition / 100} color={s.condition > 50 ? 'var(--green)' : s.condition > 25 ? 'var(--amber)' : 'var(--red)'} height={8} />
      <p>{Math.round(s.condition)}% · {s.condition < 50 ? 'Equipamentos desgastados deixam o preparo mais lento' + (s.condition < 25 ? ' e reduzem a satisfação.' : '.') : 'Tudo funcionando bem.'}</p>
      <button className="secondary" disabled={maint <= 0} onClick={() => { const r = s.maintain(); s.notify(r === true ? 'Manutenção concluída! Equipamentos 100%.' : r === 'ok' ? 'Nada a reparar.' : 'Saldo insuficiente para a manutenção.', r === false ? 'warn' : 'success') }}>{maint > 0 ? `Fazer manutenção · ${money(maint)}` : 'Equipamentos em perfeito estado'}</button>
    </div>
    <div className="info-card">
      <b><Hammer size={14} /> Reforma do salão ({s.reformLevel}/{MAX_REFORM})</b>
      <p>Renova acabamentos e móveis: +5 de conforto por nível.</p>
      <button className="secondary" disabled={s.reformLevel >= MAX_REFORM} onClick={() => { const ok = s.reform(); s.notify(ok ? 'Reforma concluída! Conforto do salão aumentou.' : 'Saldo insuficiente para reformar.', ok ? 'success' : 'warn') }}>{s.reformLevel >= MAX_REFORM ? 'Reforma completa' : `Reformar · ${money(reformCost(s.reformLevel))}`}</button>
    </div>
    <div className="focus-buttons"><Eye size={13} />
      <button onClick={() => s.camera('kitchen')}>Cozinha</button>
      <button onClick={() => s.camera('dining')}>Salão</button>
      <button onClick={() => s.camera('terrace')}>Varanda</button>
      <button onClick={() => s.camera('reset')}>Visão geral</button>
    </div>
  </>
}
