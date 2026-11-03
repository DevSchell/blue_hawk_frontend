import type { ReactNode } from 'react'
import './Topbar.css'

/** Barra superior sólida, de ponta a ponta; o conteúdo começa colado à borda esquerda */
export function Topbar({ children }: { children: ReactNode }) {
  return <header className="topbar">{children}</header>
}
