import { useEffect, useRef, type ReactNode } from 'react'
import './PillTabs.css'

type PillTab<T extends string> = {
  id: T
  label: string
  /** Contador ao lado do rótulo (ex.: itens na fila) */
  badge?: ReactNode
}

type PillTabsProps<T extends string> = {
  label: string
  tabs: PillTab<T>[]
  value: T
  onChange: (id: T) => void
}

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Abas em pílula com canto cortado (Loja, Jogue, Aprovações, chats).
 * Ao trocar de aba, o conteúdo logo abaixo (os irmãos seguintes) entra subindo de leve,
 * sem cada página precisar embrulhar o painel.
 */
export function PillTabs<T extends string>({ label, tabs, value, onChange }: PillTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const previous = useRef(value)

  useEffect(() => {
    if (previous.current === value) return
    const from = tabs.findIndex((t) => t.id === previous.current)
    const to = tabs.findIndex((t) => t.id === value)
    previous.current = value
    if (reduceMotion()) return
    const dx = to >= from ? 14 : -14
    for (let el = listRef.current?.nextElementSibling; el; el = el.nextElementSibling) {
      el.animate(
        [
          { opacity: 0, transform: `translate(${dx}px, 6px)` },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 280, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
      )
    }
  }, [value, tabs])

  return (
    <div ref={listRef} role="tablist" aria-label={label} className="pill-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className="pill-tabs__tab"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.badge != null && <span className="pill-tabs__badge">{tab.badge}</span>}
        </button>
      ))}
    </div>
  )
}
