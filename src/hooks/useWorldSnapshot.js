import { useEffect, useRef, useState } from 'react'

// Lê periodicamente um recorte do estado mutável da simulação e só
// re-renderiza quando o resultado muda (evita renderizações por quadro).
export function useWorldSnapshot(selector, hz = 6) {
  const sel = useRef(selector)
  sel.current = selector
  const [value, setValue] = useState(() => selector())
  const last = useRef(JSON.stringify(value))
  useEffect(() => {
    const id = setInterval(() => {
      const v = sel.current()
      const s = JSON.stringify(v)
      if (s !== last.current) { last.current = s; setValue(v) }
    }, 1000 / hz)
    return () => clearInterval(id)
  }, [hz])
  return value
}
