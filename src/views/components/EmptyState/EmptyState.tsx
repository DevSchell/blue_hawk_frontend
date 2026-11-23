import type { ReactNode } from 'react'
import './EmptyState.css'

type EmptyStateProps = {
  /** Ilustração à esquerda (ex.: o corvo) */
  icon: ReactNode
  title: string
  children: ReactNode
  /** Botões/ações abaixo do texto (fora do <p>, que não pode conter blocos) */
  action?: ReactNode
}

export function EmptyState({ icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div>
        <b className="empty-state__title">{title}</b>
        <p>{children}</p>
        {action}
      </div>
    </div>
  )
}
