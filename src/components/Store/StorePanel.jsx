import React, { useEffect, useState } from 'react'
import { Coins, CheckCircle2, Lock, ChevronDown, ChevronUp, Lightbulb, Award, ArrowUpCircle } from 'lucide-react'
import { useGame, satisfactionOf } from '../../systems/store'
import { SHOP_ITEMS, SHOP_CATEGORIES, COLLECTIONS, TOTAL_ITEM_LEVELS, nextStep, itemMaxLevel, collectionDone, shopItemById } from '../../data/shopItems'
import { popup } from '../../systems/world'
import { sfx } from '../../systems/audio'
import { ICONS, money, SectionHead } from '../ui'

// Gargalos atuais da operação → que efeito resolveria cada um
function bottlenecks(s) {
  const L = s.live, out = []
  const fxOf = (item) => item.fx || {}
  if (L.ovenSlots && L.ovenBusy / L.ovenSlots >= 0.75) out.push({ reason: 'Forno lotado', test: (i) => i.id.startsWith('oven') || fxOf(i).bake })
  if ((L.queued || 0) > (s.owned.prep2 ? 3 : 2)) out.push({ reason: 'Pedidos acumulando', test: (i) => i.id.startsWith('prep') || fxOf(i).prep })
  if (L.queue >= 3) out.push({ reason: 'Fila no caixa', test: (i) => fxOf(i).register })
  if (s.today.lost >= 2) out.push({ reason: 'Clientes desistindo', test: (i) => fxOf(i).patience })
  if (s.satHistory.length >= 5 && satisfactionOf(s) < 70) out.push({ reason: 'Satisfação baixa', test: (i) => fxOf(i).comfort })
  if (s.condition < 60) out.push({ reason: 'Equipamentos desgastando', test: (i) => fxOf(i).wear })
  if (s.today.revenue > 100 && s.today.ingredients / s.today.revenue > 0.25) out.push({ reason: 'Ingredientes pesando no caixa', test: (i) => fxOf(i).ingredient })
  if (L.seats && L.seatsFree / L.seats > 0.7) out.push({ reason: 'Mesas vazias', test: (i) => fxOf(i).attraction })
  return out
}

function recommend(s) {
  const picks = []
  for (const b of bottlenecks(s)) {
    const item = SHOP_ITEMS
      .filter((i) => !picks.some((p) => p.id === i.id) && b.test(i) && !s.owned[i.id])
      .filter((i) => { const c = s.canBuy(i); return c.ok || c.reason === 'Saldo insuficiente' })
      .sort((x, y) => x.price - y.price)[0]
    if (item) picks.push({ id: item.id, reason: b.reason })
    if (picks.length === 2) break
  }
  return picks
}

const SORTS = [['default', 'Padrão'], ['cheap', 'Menor preço'], ['expensive', 'Maior preço']]

function ProductCard({ item, flash, reason, onBuy, s }) {
  const Icon = ICONS[item.icon] || ICONS.Pizza
  const owned = s.owned[item.id] || 0
  const maxed = owned >= itemMaxLevel(item)
  const step = nextStep(item, owned)
  const check = s.canBuy(item)
  const poor = check.reason === 'Saldo insuficiente'
  const locked = !maxed && !check.ok && !poor
  const catClass = item.category.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  return <article className={`product-card ${maxed ? 'owned' : ''} ${locked ? 'locked' : ''} ${flash ? 'flash' : ''} ${reason ? 'suggested' : ''}`}>
    {reason ? <span className="product-tag suggest"><Lightbulb size={9} /> IDEAL AGORA: {reason}</span> : item.tag && !owned && <span className="product-tag">{item.tag}</span>}
    <div className="product-top">
      <div className={`product-icon cat-${catClass}`}><Icon /></div>
      <div className="product-main">
        <div className="product-name">{item.name}</div>
        <div className="product-type">{item.category} · {item.capacity}</div>
        {itemMaxLevel(item) > 1 && <div className="tier-pips" title={`Nível ${owned} de ${itemMaxLevel(item)}`}>{Array.from({ length: itemMaxLevel(item) }, (_, i) => <i key={i} className={i < owned ? 'on' : ''} />)}</div>}
      </div>
    </div>
    <p className="product-desc">{item.desc}</p>
    {owned > 0 && step
      ? <div className="benefit-change"><span>Agora: {owned === 1 ? item.benefit : item.upgrades[owned - 2].benefit}</span><b>✦ Nível {step.tier}: {step.benefit}</b></div>
      : <small className="benefit">✦ {maxed && owned > 1 ? item.upgrades[owned - 2].benefit : item.benefit}</small>}
    <div className="product-buy">
      {maxed
        ? <span className="done-label"><CheckCircle2 size={13} /> {itemMaxLevel(item) > 1 ? 'Nível máximo' : 'Instalado'}</span>
        : <>
          <div className="price-box"><b>{money(step.price)}</b>{poor && <small>Faltam {money(check.missing)}</small>}</div>
          <button disabled={locked} className={poor ? 'poor' : ''} onClick={() => onBuy(item)}>
            {locked ? <><Lock size={11} /> {check.reason}</> : owned ? <><ArrowUpCircle size={13} /> Evoluir</> : 'Comprar'}
          </button>
        </>}
    </div>
  </article>
}

export function StorePanel() {
  const s = useGame()
  const [category, setCategory] = useState('Tudo')
  const [sort, setSort] = useState('default')
  const [onlyAffordable, setOnlyAffordable] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const [flash, setFlash] = useState(null)
  const [tips, setTips] = useState(() => recommend(useGame.getState()))

  // Recalcula devagar para os destaques não ficarem piscando
  useEffect(() => {
    const id = setInterval(() => setTips(recommend(useGame.getState())), 8000)
    return () => clearInterval(id)
  }, [])

  const buy = (item) => {
    const check = s.canBuy(item)
    if (!check.ok) { s.notify(`${item.name}: ${check.reason === 'Saldo insuficiente' ? `faltam ${money(check.missing)}` : check.reason === 'Adquirido' ? 'já adquirido' : `bloqueado (${check.reason})`}.`, 'warn'); return }
    const owned = s.owned[item.id] || 0
    const step = nextStep(item, owned)
    const result = s.buyItem(item.id)
    if (!result) return
    sfx(owned ? 'upgrade' : 'buy')
    setFlash(item.id)
    setTimeout(() => setFlash((f) => (f === item.id ? null : f)), 900)
    s.notify(owned ? `${item.name} evoluiu para o nível ${step.tier}! ${step.benefit}.` : `${item.name} instalado na pizzaria! ${item.benefit}.`, 'success')
    if (item.spot) {
      popup(item.spot[0], item.spot[1], owned ? '⬆ Evoluído!' : '✦ Novo!', '#c98a12')
      if (!owned) s.camera('focus', item.spot)
    }
    for (const c of result.collections) {
      setTimeout(() => { sfx('star'); s.notify(`Coleção completa: ${c.name}! ${c.benefit}.`, 'level') }, 500)
    }
    setTips((t) => t.filter((x) => x.id !== item.id))
  }

  const inCategory = SHOP_ITEMS.filter((x) => category === 'Tudo' || x.category === category)
  const isDone = (i) => (s.owned[i.id] || 0) >= itemMaxLevel(i)
  const priceOf = (i) => nextStep(i, s.owned[i.id] || 0)?.price ?? 0
  const rank = (i) => { const c = s.canBuy(i); return c.ok ? 0 : c.reason === 'Saldo insuficiente' ? 1 : 2 }
  let open = inCategory.filter((i) => !isDone(i))
  if (onlyAffordable) open = open.filter((i) => s.canBuy(i).ok)
  open = [...open].sort((a, b) => {
    if (sort === 'cheap') return priceOf(a) - priceOf(b)
    if (sort === 'expensive') return priceOf(b) - priceOf(a)
    return rank(a) - rank(b) || priceOf(a) - priceOf(b)
  })
  const done = inCategory.filter(isDone)
  const tipFor = (id) => tips.find((t) => t.id === id)?.reason
  const tipItems = tips.map((t) => shopItemById(t.id)).filter((i) => i && open.includes(i))
  const rest = open.filter((i) => !tipItems.includes(i))

  const levelsOwned = SHOP_ITEMS.reduce((a, i) => a + (s.owned[i.id] || 0), 0)
  const finishedCollections = COLLECTIONS.filter((c) => collectionDone(c, s.owned)).length
  return <>
    <SectionHead kicker="CATÁLOGO DA PIZZARIA" title="Loja de equipamentos" right={<span className="store-balance"><Coins size={13} /> {money(s.money)}</span>} />
    <div className="category-list">{SHOP_CATEGORIES.map((c) => <button key={c} className={category === c ? 'on' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
    <div className="store-filters">
      <label className="check"><input type="checkbox" checked={onlyAffordable} onChange={(e) => setOnlyAffordable(e.target.checked)} /> Posso comprar</label>
      <select aria-label="Ordenar" value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
    </div>
    <div className="store-progress"><span>{levelsOwned}/{TOTAL_ITEM_LEVELS} melhorias da loja</span><i><em style={{ width: `${(levelsOwned / TOTAL_ITEM_LEVELS) * 100}%` }} /></i></div>

    <button className="fold-head" onClick={() => setShowCollections((v) => !v)}>
      <Award size={14} /> Coleções ({finishedCollections}/{COLLECTIONS.length}) {showCollections ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {showCollections && <div className="collection-list">{COLLECTIONS.map((c) => {
      const have = c.items.filter((id) => s.owned[id]).length, full = have === c.items.length
      return <div key={c.id} className={`collection ${full ? 'full' : ''}`}>
        <b>{c.name} <em>{have}/{c.items.length}</em></b>
        <small className="benefit">✦ {c.benefit}</small>
        <div className="collection-items">{c.items.map((id) => <span key={id} className={s.owned[id] ? 'on' : ''}>{shopItemById(id).name}</span>)}</div>
      </div>
    })}</div>}

    <div className="product-list">
      {[...tipItems, ...rest].map((item) => <ProductCard key={item.id} item={item} s={s} onBuy={buy} flash={flash === item.id} reason={tipFor(item.id)} />)}
      {!open.length && <p className="muted empty-note">{onlyAffordable ? 'Nada cabe no saldo atual nesta categoria.' : 'Tudo desta categoria está no nível máximo!'}</p>}
    </div>

    {done.length > 0 && <>
      <button className="fold-head" onClick={() => setShowDone((v) => !v)}>
        <CheckCircle2 size={14} /> Instalados no máximo ({done.length}) {showDone ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {showDone && <div className="product-list">{done.map((item) => <ProductCard key={item.id} item={item} s={s} onBuy={buy} flash={flash === item.id} />)}</div>}
    </>}
  </>
}
