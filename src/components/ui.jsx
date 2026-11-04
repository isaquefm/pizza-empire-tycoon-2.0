import React from 'react'
import {
  Utensils, Refrigerator, Package, ChefHat, Calculator, Cog, Flame, Lamp, Armchair, GlassWater,
  Music, Snowflake, Sparkles, Sprout, Frame, Lightbulb, Pizza,
} from 'lucide-react'

export const ICONS = { Utensils, Refrigerator, Package, ChefHat, Calculator, Cog, Flame, Lamp, Armchair, GlassWater, Music, Snowflake, Sparkles, Sprout, Frame, Lightbulb, Pizza }

export const fmt = (n) => Math.round(n).toLocaleString('pt-BR')
export const money = (n) => `R$ ${fmt(n)}`
export const clockStr = (c) => {
  const m = Math.floor(c) % (24 * 60)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function Bar({ value, color = 'var(--green)', height = 6 }) {
  return <div className="bar" style={{ height }}><i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} /></div>
}

export function SectionHead({ kicker, title, right }) {
  return <div className="section-heading"><div><small>{kicker}</small><b>{title}</b></div>{right}</div>
}

export function Row({ label, value, tone }) {
  return <div className={`finance-row ${tone || ''}`}><span>{label}</span><b>{value}</b></div>
}

export const patienceColor = (v) => (v > 0.6 ? 'var(--green)' : v > 0.3 ? 'var(--amber)' : 'var(--red)')
