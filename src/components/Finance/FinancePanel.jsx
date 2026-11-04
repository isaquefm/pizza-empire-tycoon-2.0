import React from 'react'
import { useGame } from '../../systems/store'
import { operatingCost, getModifiers, pizzaPrice, ingredientCost, unlockedRecipes } from '../../systems/Economy/economy'
import { money, SectionHead, Row } from '../ui'

function HistoryChart({ history }) {
  const data = history.slice(-10)
  if (!data.length) return <p className="muted">O histórico aparece ao fim do primeiro dia de operação.</p>
  const W = 300, H = 120, pad = 18
  const max = Math.max(1, ...data.map((d) => Math.max(d.revenue + d.tips, d.ingredients + d.salaries + d.operating + d.maintenance)))
  const bw = (W - pad) / data.length
  const y = (v) => H - pad - (v / max) * (H - pad - 8)
  return <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Receitas e despesas por dia">
    <line x1={pad} x2={W} y1={H - pad} y2={H - pad} stroke="#d8cdbd" />
    {data.map((d, i) => {
      const inc = d.revenue + d.tips, cost = d.ingredients + d.salaries + d.operating + d.maintenance
      const x = pad + i * bw
      return <g key={d.day}>
        <rect x={x + 3} y={y(inc)} width={bw / 2 - 4} height={H - pad - y(inc)} rx="2" fill="var(--green)"><title>Dia {d.day}: receita {money(inc)}</title></rect>
        <rect x={x + bw / 2} y={y(cost)} width={bw / 2 - 4} height={H - pad - y(cost)} rx="2" fill="var(--red)" opacity="0.8"><title>Dia {d.day}: despesas {money(cost)}</title></rect>
        <text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="#778092">D{d.day}</text>
      </g>
    })}
  </svg>
}

export function FinancePanel() {
  const s = useGame()
  const t = s.today
  const salaries = s.staff.reduce((a, m) => a + m.salary, 0)
  const operating = operatingCost(s)
  const income = t.revenue + t.tips
  const costs = t.ingredients + t.maintenance + salaries + operating
  const profit = income - costs
  const mods = getModifiers(s)
  const totalProfit = s.history.reduce((a, d) => a + d.profit, 0)
  return <>
    <SectionHead kicker="CONTROLE FINANCEIRO" title="Finanças da pizzaria" />
    <div className="finance-hero">
      <small>SALDO DISPONÍVEL</small>
      <strong className={s.money < 0 ? 'neg' : ''}>{money(s.money)}</strong>
      <span>Faturamento acumulado: {money(s.lifetime)} · Lucro histórico: {money(totalProfit)}</span>
    </div>
    <div className="info-card">
      <b>Hoje · Dia {s.day}</b>
      <Row label="Vendas" value={money(t.revenue)} tone="pos" />
      <Row label="Gorjetas" value={money(t.tips)} tone="pos" />
      <Row label="Ingredientes" value={`− ${money(t.ingredients)}`} tone="neg" />
      <Row label="Manutenção" value={`− ${money(t.maintenance)}`} tone="neg" />
      <Row label="Salários (fechamento)" value={`− ${money(salaries)}`} tone="neg" />
      <Row label="Custos operacionais (aluguel, energia)" value={`− ${money(operating)}`} tone="neg" />
      <Row label="Resultado previsto do dia" value={money(profit)} tone={profit >= 0 ? 'pos strong' : 'neg strong'} />
      <Row label="Investimentos (compras)" value={money(t.purchases)} />
      <Row label="Pedidos · Delivery · Perdidos" value={`${t.served} · ${t.deliveries} · ${t.lost}`} />
    </div>
    <div className="info-card">
      <b>Receitas × despesas (últimos dias)</b>
      <div className="legend"><span><i style={{ background: 'var(--green)' }} /> Receita</span><span><i style={{ background: 'var(--red)' }} /> Despesas</span></div>
      <HistoryChart history={s.history} />
    </div>
    <div className="info-card">
      <b>Cardápio e margens</b>
      <table className="mini-table"><thead><tr><th>Pizza</th><th>Preço</th><th>Custo</th><th>Margem</th></tr></thead><tbody>
        {unlockedRecipes(s).map((r) => {
          const price = Math.round(pizzaPrice(r, s.ovenLevel) * mods.revenueMult), cost = ingredientCost(r, mods)
          return <tr key={r.id}><td>{r.name}</td><td>{money(price)}</td><td>{money(cost)}</td><td>{Math.round((1 - cost / price) * 100)}%</td></tr>
        })}
      </tbody></table>
    </div>
    {s.history.length > 0 && <div className="info-card">
      <b>Histórico financeiro</b>
      <table className="mini-table"><thead><tr><th>Dia</th><th>Receita</th><th>Despesas</th><th>Lucro</th></tr></thead><tbody>
        {s.history.slice(-8).reverse().map((d) => <tr key={d.day}><td>{d.day}</td><td>{money(d.revenue + d.tips)}</td><td>{money(d.ingredients + d.salaries + d.operating + d.maintenance)}</td><td className={d.profit >= 0 ? 'pos' : 'neg'}>{money(d.profit)}</td></tr>)}
      </tbody></table>
    </div>}
  </>
}
