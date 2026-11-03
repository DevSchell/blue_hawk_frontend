import type { Boardgame } from '../../../models/boardgame'
import { GameCover } from './GameCover'
import './GameCard.css'

function players(n: number) {
  return n === 1 ? '1 jogador' : `${n} jogadores`
}

export function GameCard({ game }: { game: Boardgame }) {
  const details = [
    game.playerNumber ? players(game.playerNumber) : null,
    game.playTime ? `${game.playTime} min` : null,
  ].filter(Boolean)

  return (
    <article className="game-card">
      <GameCover id={game.id} name={game.name} />
      <div className="game-card__body">
        <h3 className="game-card__title">{game.name}</h3>
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
