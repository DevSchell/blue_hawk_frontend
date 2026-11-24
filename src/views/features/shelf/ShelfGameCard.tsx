import { approvalStatusOf } from '../../../models/boardgame'
import type { ShelfGame } from '../../../models/shelf'
import { cx } from '../../utils/classNames'
import { CategoryTag } from '../boardgames/CategoryTag'
import { formatPlayers } from '../boardgames/format'
import { GameCover } from '../boardgames/GameCover'
import './ShelfGameCard.css'
import { coverOf } from '../../../models/services/boardgameService'

type ShelfGameCardProps = {
  game: ShelfGame
  isLit: boolean
  isAltLit: boolean
  isWinner: boolean
  onOpen: (game: ShelfGame) => void
}

export function ShelfGameCard({ game, isLit, isAltLit, isWinner, onOpen }: ShelfGameCardProps) {
  const { boardgame, plays, hours, forSale, salePrice } = game
  const status = approvalStatusOf(boardgame)

  return (
    <article
      data-game-id={game.userBoardgameId}
      className={cx(
        'shelf-card',
        forSale && 'shelf-card--for-sale',
        isLit && 'shelf-card--lit',
        isAltLit && 'shelf-card--lit-alt',
        isWinner && 'shelf-card--winner',
      )}
    >
      <div className="shelf-card__media">
        <GameCover id={boardgame.id} name={boardgame.name} {...coverOf(boardgame)} />
        {forSale && (
          <>
            <span className="badge shelf-card__ribbon">À venda</span>
            <span className="shelf-card__price-tag">R$ {salePrice}</span>
          </>
        )}
        {status !== 'APPROVED' && (
          <span className={cx('badge', 'shelf-card__status', `shelf-card__status--${status.toLowerCase()}`)}>
            {status === 'PENDING' ? 'Em aprovação' : 'Recusado'}
          </span>
        )}
        {isWinner && <span className="shelf-card__winner-badge">★ Jogo Sorteado (D20) ★</span>}
      </div>

      <div className="shelf-card__body">
        <div className="shelf-card__header">
          <h3 className="shelf-card__title">
            <button
              type="button"
              className="shelf-card__open"
              aria-haspopup="dialog"
              onClick={() => onOpen(game)}
            >
              {boardgame.name}
            </button>
          </h3>

          <div className="shelf-card__meta-row">
            <CategoryTag game={boardgame} />
            {boardgame.playerNumber && (
              <span className="shelf-card__players">{formatPlayers(boardgame.playerNumber)}</span>
            )}
          </div>
        </div>

        <div className="shelf-card__scores">
          <div className="shelf-card__score">
            <span className="shelf-card__score-label">Partidas</span>
            <span className="shelf-card__score-value">{plays}x</span>
          </div>
          <div className="shelf-card__score">
            <span className="shelf-card__score-label">Mesa</span>
            <span className="shelf-card__score-value shelf-card__score-value--accent">{hours}h</span>
          </div>
        </div>
      </div>

      {forSale && (
        <div className="shelf-card__sale-footer">
          <span>Anunciado na loja</span>
          <span>R$ {salePrice}</span>
        </div>
      )}
    </article>
  )
}
