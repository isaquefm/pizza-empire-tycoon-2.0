import React, { useState } from 'react'
import { ShoppingCart, Store, ChartNoAxesCombined, Users, ChefHat, ArrowUpCircle, ClipboardList } from 'lucide-react'
import { useGame } from '../../systems/store'
import { SHOP_ITEMS } from '../../data/shopItems'
import { StorePanel } from '../Store/StorePanel'
import { RestaurantPanel } from '../Restaurant/RestaurantPanel'
import { FinancePanel } from '../Finance/FinancePanel'
import { CustomersPanel } from '../Customers/CustomersPanel'
import { EmployeesPanel } from '../Employees/EmployeesPanel'
import { UpgradesPanel } from '../Upgrades/UpgradesPanel'
import { BoardPanel } from '../Board/BoardPanel'

const TABS = [
  ['Loja', ShoppingCart, StorePanel],
  ['Restaurante', Store, RestaurantPanel],
  ['Finanças', ChartNoAxesCombined, FinancePanel],
  ['Clientes', Users, CustomersPanel],
  ['Equipe', ChefHat, EmployeesPanel],
  ['Melhorias', ArrowUpCircle, UpgradesPanel],
  ['Mural', ClipboardList, BoardPanel],
]

export function Sidebar() {
  const tab = useGame((s) => s.tab) || 'Loja'
  const setTab = (t) => useGame.setState({ tab: t })
  const affordable = useGame((s) => SHOP_ITEMS.some((i) => s.canBuy(i).ok))
  const staffUnlocked = useGame((s) => s.unlocked.staff && s.staff.length === 0)
  const claimable = useGame((s) => Object.keys(s.goalsDone).some((id) => !s.goalsClaimed[id]))
  const [collapsed, setCollapsed] = useState(false)
  const Panel = TABS.find((t) => t[0] === tab)?.[2] || StorePanel
  return <aside className={`sim-sidebar ${collapsed ? 'collapsed' : ''}`}>
    <nav className="sim-nav">
      {TABS.map(([name, Icon]) => <button key={name} className={tab === name ? 'selected' : ''} onClick={() => { setTab(name); setCollapsed(false) }} title={name}>
        <Icon /><span>{name}</span>
        {name === 'Loja' && affordable && <i className="nav-dot" />}
        {name === 'Equipe' && staffUnlocked && <i className="nav-dot" />}
        {name === 'Mural' && claimable && <i className="nav-dot" />}
      </button>)}
      <button className="collapse-btn" onClick={() => setCollapsed((v) => !v)} title={collapsed ? 'Expandir painel' : 'Recolher painel'}>{collapsed ? '‹' : '›'}</button>
    </nav>
    {!collapsed && <div className="sidebar-content"><Panel /></div>}
  </aside>
}
