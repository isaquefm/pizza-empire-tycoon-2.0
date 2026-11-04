import React from 'react'
import { useGame } from '../../systems/store'

export function Toasts() {
  const notices = useGame((s) => s.notices)
  return <div className="toasts" aria-live="polite">
    {notices.map((n) => <div key={n.id} className={`toast ${n.type}`}><span className="notice-led" />{n.text}</div>)}
  </div>
}
