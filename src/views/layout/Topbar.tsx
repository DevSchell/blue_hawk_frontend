import type { ReactNode } from 'react'
import './Topbar.css'

/** Barra superior sólida, de ponta a ponta; logo e navegação à esquerda, menu do usuário à direita */
export function Topbar({ children }: { children: ReactNode }) {
  return <header className="topbar">{children}</header>
}
