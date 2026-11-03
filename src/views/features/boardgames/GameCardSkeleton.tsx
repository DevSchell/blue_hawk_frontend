import './GameCard.css'

/** Card de jogo enquanto a lista carrega */
export function GameCardSkeleton() {
  return (
    <div className="game-card game-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--cover" />
      <div className="game-card__body">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--short" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    </div>
  )
}
