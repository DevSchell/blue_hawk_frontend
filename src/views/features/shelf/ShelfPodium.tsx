import type { ShelfGame } from '../../../models/shelf'
import { Container } from '../../components/Container/Container'
import { cx } from '../../utils/classNames'
import { GameCover } from '../boardgames/GameCover'
import './ShelfPodium.css'
import { coverOf } from '../../../models/services/boardgameService'

type ShelfPodiumProps = {
  games: ShelfGame[]
  onOpenGame: (game: ShelfGame) => void
}

export function ShelfPodium({ games, onOpenGame }: ShelfPodiumProps) {
  if (games.length === 0) return null

  const podiumSlots =
    games.length >= 3
      ? [
          { game: games[1], rank: 2, label: '2º Lugar', variant: 'second' },
          { game: games[0], rank: 1, label: '1º Lugar • Mais Jogado', variant: 'first' },
          { game: games[2], rank: 3, label: '3º Lugar', variant: 'third' },
        ]
      : games.map((game, index) => ({
          game,
          rank: index + 1,
          label: index === 0 ? '1º Lugar • Mais Jogado' : `${index + 1}º Lugar`,
          variant: index === 0 ? 'first' : 'second',
        }))

  return (
    <section aria-labelledby="podium-heading" className="shelf-podium">
      <Container>
        <div className="shelf-podium__head">
          <span className="shelf-podium__bar" aria-hidden="true" />
          <h2 id="podium-heading" className="shelf-podium__title">
            Pódio da mesa
          </h2>
          <span className="shelf-podium__sub">• Os títulos mais jogados da sua estante</span>
        </div>

        <div className="shelf-podium__grid">
          {podiumSlots.map(({ game, rank, label, variant }) => (
            <button
              key={game.userBoardgameId}
              type="button"
              onClick={() => onOpenGame(game)}
              className={cx('podium-step', `podium-step--${variant}`)}
            >
              <div className="podium-step__thumb">
                <GameCover id={game.boardgame.id} name={game.boardgame.name} {...coverOf(game.boardgame)} />
                <span className={cx('podium-step__rank', `podium-step__rank--${variant}`)}>#{rank}</span>
              </div>

              <div className="podium-step__info">
                <span className="podium-step__label">{label}</span>
                <h3 className="podium-step__title">{game.boardgame.name}</h3>
                <div className="podium-step__stats">
                  <span>{game.plays}x partidas</span>
                  <span>{game.hours}h jogadas</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Container>
    </section>
  )
}
