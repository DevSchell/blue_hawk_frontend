import type { ReactNode } from 'react'
import './EmptyState.css'

type EmptyStateProps = {
  /** Ilustração à esquerda (ex.: o corvo) */
  icon: ReactNode
  title: string
  children: ReactNode
}

export function EmptyState({ icon, title, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div>
        <b className="empty-state__title">{title}</b>
        <p>{children}</p>
      </div>
    </div>
  )
}
