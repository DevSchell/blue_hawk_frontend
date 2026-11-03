import type { Boardgame } from '../../../models/boardgame'
import { formatPlayers } from './format'
import { GameCover } from './GameCover'
import './GameCard.css'

type GameCardProps = {
  game: Boardgame
  /** Abre os detalhes do jogo; o card inteiro é clicável */
  onOpen: (game: Boardgame) => void
}

export function GameCard({ game, onOpen }: GameCardProps) {
  const details = [
    game.playerNumber ? formatPlayers(game.playerNumber) : null,
    game.playTime ? `${game.playTime} min` : null,
  ].filter(Boolean)

  return (
    <article className="game-card">
      <GameCover id={game.id} name={game.name} />
      <div className="game-card__body">
        <h3 className="game-card__title">
          {/* O botão fica no título (é o nome acessível) e se estende pelo card todo */}
          <button type="button" className="game-card__open" aria-haspopup="dialog" onClick={() => onOpen(game)}>
            {game.name}
          </button>
        </h3>
        {details.length > 0 && <p className="game-card__tags">{details.join(' · ')}</p>}
        {game.description && <p className="game-card__desc">{game.description}</p>}
        {game.releaseYear && (
          <p className="game-card__meta">
            <span>Lançamento</span>
            <b>{game.releaseYear}</b>
          </p>
        )}
      </div>
    </article>
  )
}
