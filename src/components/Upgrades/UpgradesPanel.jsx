import React from 'react'
import { Flame, Zap, Megaphone, Pizza, Building2, Crown, Lock, CheckCircle2, ArrowUp } from 'lucide-react'
import { useGame } from '../../systems/store'
import { ovenUpgradeCost, speedUpgradeCost, marketingCost, MAX_MARKETING, EXPANSIONS, franchiseCost, franchiseReq, canFranchise, pizzaPrice } from '../../systems/Economy/economy'
import { RECIPES } from '../../data/recipes'
import { money, SectionHead } from '../ui'

function UpgradeCard({ icon: Icon, title, level, max, desc, cost, onBuy, disabled, doneLabel = 'Máximo' }) {
  const done = level >= max
  return <div className="upgrade-card">
    <div className="upgrade-icon"><Icon /></div>
    <div className="upgrade-main">
      <b>{title}</b>
      <div className="pips">{Array.from({ length: max }, (_, i) => <i key={i} className={i < level ? 'on' : ''} />)}</div>
      <p>{desc}</p>
    </div>
    <button disabled={done || disabled} onClick={onBuy}>{done ? doneLabel : money(cost)}</button>
  </div>
}

export function UpgradesPanel() {
  const s = useGame()
  const say = (ok, good, bad = 'Saldo insuficiente.') => s.notify(ok ? good : bad, ok ? 'success' : 'warn')
  const all = () => {
    const r = s.upgradeAll()
    s.notify(r.bought ? `${r.bought} melhoria(s) aplicada(s) por ${money(r.spent)}.` : 'Nenhuma melhoria cabe no saldo atual.', r.bought ? 'success' : 'warn')
  }
  return <>
    <SectionHead kicker="PRODUÇÃO E CRESCIMENTO" title="Melhorias" right={<button className="pill-btn" onClick={all}><ArrowUp size={13} /> Melhorar tudo</button>} />
    <UpgradeCard icon={Flame} title={`Forno · nível ${s.ovenLevel}`} level={s.ovenLevel} max={10} cost={ovenUpgradeCost(s.ovenLevel)}
      desc={`+R$ 3 por pizza e assa 7% mais rápido. Margherita hoje: ${money(pizzaPrice(RECIPES[0], s.ovenLevel))}.`}
      onBuy={() => say(s.upgradeOven(), 'Forno aprimorado! Pizzas mais rápidas e valiosas.')} />
    <UpgradeCard icon={Zap} title={`Agilidade da equipe · nível ${s.speedLevel}`} level={s.speedLevel} max={10} cost={speedUpgradeCost(s.speedLevel)}
      desc="Treinamento geral: todos andam 6% e trabalham 3% mais rápido por nível."
      onBuy={() => say(s.upgradeSpeed(), 'Equipe mais ágil!')} />
    <UpgradeCard icon={Megaphone} title={`Marketing · nível ${s.marketingLevel}`} level={s.marketingLevel} max={MAX_MARKETING} cost={marketingCost(s.marketingLevel)}
      desc="Panfletos, redes sociais e parcerias: +12% de movimento por nível."
      onBuy={() => say(s.upgradeMarketing(), 'Campanha lançada! Mais clientes a caminho.')} />

    <div className="section-heading sub"><div><small>CARDÁPIO</small><b>Novas receitas</b></div></div>
    <div className="recipe-grid">{RECIPES.map((r) => {
      const has = s.recipes.includes(r.id), locked = s.level < r.level
      return <div key={r.id} className={`recipe ${has ? 'owned' : ''} ${locked ? 'locked' : ''}`}>
        <span className="recipe-dot" style={{ background: r.color }}><Pizza size={14} /></span>
        <div><b>{r.name}</b><small>{r.desc}</small><em>{money(pizzaPrice(r, s.ovenLevel))} por pizza</em></div>
        {has ? <CheckCircle2 size={16} className="ok" /> : locked ? <span className="lock"><Lock size={11} /> Nv {r.level}</span>
          : <button onClick={() => say(s.unlockRecipe(r.id), `${r.name} entrou no cardápio!`)}>{money(r.unlockCost)}</button>}
      </div>
    })}</div>

    <div className="section-heading sub"><div><small>EXPANSÃO</small><b>Ampliações</b></div></div>
    {EXPANSIONS.map((e) => {
      const has = s.expansions[e.id], locked = s.level < e.level
      return <div className="upgrade-card" key={e.id}>
        <div className="upgrade-icon"><Building2 /></div>
        <div className="upgrade-main"><b>{e.name}</b><p>{e.desc}</p><small className="benefit">✦ {e.benefit}</small></div>
        <button disabled={has || locked} onClick={() => say(s.buildExpansion(e.id), `${e.name} concluída!`)}>{has ? 'Construída' : locked ? `Nível ${e.level}` : money(e.price)}</button>
      </div>
    })}
    <div className="upgrade-card franchise">
      <div className="upgrade-icon"><Crown /></div>
      <div className="upgrade-main"><b>Nova unidade (franquia)</b>
        <p>Abra uma nova pizzaria: a unidade atual é reiniciada, mas você mantém o saldo e as receitas, sobe 1 nível e ganha +15% de faturamento permanente por unidade. Requisitos: nível {franchiseReq(s.franchises).level} e {franchiseReq(s.franchises).served} pedidos nesta unidade ({s.served} até agora). Custo: {money(franchiseCost(s.franchises))}. Unidades abertas: {s.franchises}.</p></div>
      <button disabled={!canFranchise(s)} onClick={() => s.ask({
        title: 'Abrir uma nova unidade?',
        text: 'A pizzaria atual será reiniciada: equipe, equipamentos e mesas. Você mantém o saldo, as receitas e as metas.',
        confirmLabel: `Abrir por ${money(franchiseCost(s.franchises))}`,
        onConfirm: () => say(s.buyFranchise(), 'Nova unidade inaugurada! Bem-vindo à próxima etapa do império.'),
      })}>{canFranchise(s) ? money(franchiseCost(s.franchises)) : `Nível ${franchiseReq(s.franchises).level}`}</button>
    </div>
  </>
}
