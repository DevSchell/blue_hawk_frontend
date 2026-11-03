import type { ReactNode } from 'react'
import './GameGrid.css'

/** Grade responsiva de cards: colunas de no mínimo 260px */
export function GameGrid({ children, busy = false }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className="game-grid" aria-busy={busy}>
      {children}
    </div>
  )
}
