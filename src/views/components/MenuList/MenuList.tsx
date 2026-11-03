import type { ReactNode } from 'react'
import './MenuList.css'

export function MenuList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label}>
      <ul className="menu-list">{children}</ul>
    </nav>
  )
}

type MenuItemProps = {
  icon: ReactNode
  label: string
  /** Texto curto à direita (ex.: "Em breve") */
  hint?: string
  onClick?: () => void
  /** Item visível mas sem ação */
  disabled?: boolean
}

export function MenuItem({ icon, label, hint, onClick, disabled = false }: MenuItemProps) {
  return (
    <li>
      <button
        type="button"
        className="menu-item"
        aria-disabled={disabled || undefined}
        onClick={disabled ? undefined : onClick}
      >
        {icon}
        <span>{label}</span>
        {hint && <small className="menu-item__hint">{hint}</small>}
      </button>
    </li>
  )
}
