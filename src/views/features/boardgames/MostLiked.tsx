import { useMostLiked } from '../../../controllers/useMostLiked'
import type { Boardgame } from '../../../models/boardgame'
import { coverOf } from '../../../models/services/boardgameService'
import { cx } from '../../utils/classNames'
import { GameCover } from './GameCover'
import { LikeButton } from './LikeButton'
import './MostLiked.css'

type MostLikedProps = {
  onOpenGame: (game: Boardgame) => void
}

/**
 * Ranking "Mais curtidos" no topo da Wiki: o 1º lugar em destaque (horizontal) e os seguintes como mini-cards,
 * com o número e o coração sobre a capa, para o nome ter a largura toda.
 */
export function MostLiked({ onOpenGame }: MostLikedProps) {
  const ranking = useMostLiked()

  if (ranking.loading || ranking.failed) return null

  return (
    <section className="most-liked" aria-labelledby="most-liked-title">
      <div className="most-liked__head">
        <h2 id="most-liked-title" className="most-liked__title">
          Mais curtidos
        </h2>
        <p className="most-liked__lead">Os jogos favoritos da comunidade.</p>
      </div>

      {ranking.games.length === 0 ? (
        <p className="most-liked__empty">
          Nenhum jogo curtido ainda. Toque no coração de um jogo para ele entrar no ranking.
        </p>
      ) : (
        <ol className="most-liked__list">
          {ranking.games.map((game, index) => {
            const first = index === 0
            return (
              <li key={game.id} className={cx('most-liked__item', first && 'most-liked__item--first')}>
                <div className="most-liked__cover">
                  <GameCover id={game.id} name={game.name} {...coverOf(game)} />
                  <span className="most-liked__rank" aria-hidden="true">
                    {index + 1}
                  </span>
                  {!first && <LikeButton game={game} variant="overlay" />}
                </div>
                <div className="most-liked__info">
                  <button type="button" className="most-liked__open" onClick={() => onOpenGame(game)}>
                    <span className="visually-hidden">{index + 1}º lugar: </span>
                    {game.name}
                  </button>
                  {game.category && <span className="most-liked__category">{game.category}</span>}
                </div>
                {first && <LikeButton game={game} variant="inline" className="most-liked__like" />}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
