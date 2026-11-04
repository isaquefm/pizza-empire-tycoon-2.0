import React, { useState } from 'react'
import { Coins, CheckCircle2, Lock } from 'lucide-react'
import { useGame } from '../../systems/store'
import { SHOP_ITEMS, SHOP_CATEGORIES } from '../../data/shopItems'
import { ICONS, money, SectionHead } from '../ui'

export function StorePanel() {
  const [category, setCategory] = useState('Tudo')
  const s = useGame()
  const items = SHOP_ITEMS.filter((x) => category === 'Tudo' || x.category === category)
  const buy = (item) => {
    const check = s.canBuy(item)
    if (!check.ok) { s.notify(`${item.name}: ${check.reason === 'Saldo insuficiente' ? 'saldo insuficiente' : check.reason === 'Adquirido' ? 'já adquirido' : `bloqueado (${check.reason})`}.`, 'warn'); return }
    if (s.buyItem(item.id)) s.notify(`${item.name} instalado na pizzaria! ${item.benefit}.`, 'success')
  }
  const ownedCount = SHOP_ITEMS.filter((i) => s.owned[i.id]).length
  return <>
    <SectionHead kicker="CATÁLOGO DA PIZZARIA" title="Loja de equipamentos" right={<span className="store-balance"><Coins size={13} /> {money(s.money)}</span>} />
    <div className="category-list">{SHOP_CATEGORIES.map((c) => <button key={c} className={category === c ? 'on' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
    <div className="store-progress"><span>{ownedCount}/{SHOP_ITEMS.length} itens adquiridos</span><i><em style={{ width: `${(ownedCount / SHOP_ITEMS.length) * 100}%` }} /></i></div>
    <div className="product-list">{items.map((item) => {
      const Icon = ICONS[item.icon] || ICONS.Pizza
      const check = s.canBuy(item)
      const has = !!s.owned[item.id]
      const locked = !has && check.reason && check.reason !== 'Saldo insuficiente'
      return <article className={`product-card ${has ? 'owned' : ''} ${locked ? 'locked' : ''}`} key={item.id}>
        {item.tag && !has && <span className="product-tag">{item.tag}</span>}
        <div className={`product-icon cat-${item.category.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}`}><Icon /></div>
        <div className="product-main">
          <div className="product-name">{item.name}</div>
          <div className="product-type">{item.category} · {item.capacity}</div>
          <p>{item.desc}</p>
          <small className="benefit">✦ {item.benefit}</small>
        </div>
        <div className="product-buy">
          <b>{money(item.price)}</b>
          <button disabled={has || locked} className={!has && !locked && !check.ok ? 'poor' : ''} onClick={() => buy(item)}>
            {has ? <><CheckCircle2 size={12} /> Instalado</> : locked ? <><Lock size={11} /> {check.reason}</> : 'Comprar'}
          </button>
        </div>
      </article>
    })}</div>
  </>
}
