import type { MyMatch } from '../../../models/services/matchesService'
import { resolveMatchDate, resolveMatchDuration } from '../../../models/services/matchesService'
import { Button } from '../../components/Button/Button'
import { CalendarIcon, ClockIcon, GamesIcon, UsersIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
import { CategoryTag } from '../../features/boardgames/CategoryTag'
import { formatMatchDate, formatMatchDuration, formatMatchFullDate, formatPlayers } from '../../features/boardgames/format'
import { GameCover } from '../../features/boardgames/GameCover'

type MatchDetailModalProps = {
  item: MyMatch
  currentUserId?: string | null
  onClose: () => void
}

export function MatchDetailModal({ item, currentUserId, onClose }: MatchDetailModalProps) {
  const { match, game, hostId, hostName, players } = item
  const isHost = hostId === currentUserId
  const matchDate = resolveMatchDate(match)
  const durationMinutes = resolveMatchDuration(match, game)
  const formattedDuration = formatMatchDuration(durationMinutes)
  const formattedFullDate = formatMatchFullDate(matchDate)
  const formattedShortDate = formatMatchDate(matchDate)

  return (
    <Modal
      open
      onClose={onClose}
      title={game.name}
      lead="Histórico e detalhes da partida"
      size="lg"
      media={<GameCover id={game.id} name={game.name} />}
    >
      <div className="match-modal__top-meta">
        <CategoryTag game={game} />
        <span className="match-modal__badge match-modal__badge--accent">
          {isHost ? 'Você foi o anfitrião' : `Anfitrião: ${hostName}`}
        </span>
        <span className="match-modal__badge">Partida Registrada</span>
      </div>

      {/* Grid com os destaques solicitados: Duração, Data e Jogo */}
      <dl className="match-modal__facts">
        <div className="match-modal__fact" title="Tempo total de duração da partida">
          <ClockIcon />
          <dt>Duração da partida</dt>
          <dd>{formattedDuration}</dd>
        </div>

        <div className="match-modal__fact" title="Data em que a partida foi jogada">
          <CalendarIcon />
          <dt>Data da partida</dt>
          <dd>{formattedShortDate}</dd>
        </div>

        <div className="match-modal__fact" title="Jogo de tabuleiro desta sessão">
          <GamesIcon />
          <dt>Jogo da partida</dt>
          <dd>{game.name}</dd>
        </div>

        <div className="match-modal__fact" title="Total de jogadores que participaram da mesa">
          <UsersIcon />
          <dt>Total na mesa</dt>
          <dd>{players.length} {players.length === 1 ? 'jogador' : 'jogadores'}</dd>
        </div>
      </dl>

      <section className="match-modal__section" aria-labelledby="match-modal-game-info">
        <h3 id="match-modal-game-info">Sobre o jogo</h3>
        <p className={game.description ? 'match-modal__description' : 'match-modal__description match-modal__description--empty'}>
          {game.description || 'Este jogo não possui descrição detalhada cadastrada.'}
        </p>

        <div className="match-modal__tags-row">
          {game.publisher && (
            <span className="match-modal__detail-chip">
              <strong>Editora:</strong> {game.publisher}
            </span>
          )}
          {game.releaseYear && (
            <span className="match-modal__detail-chip">
              <strong>Ano:</strong> {game.releaseYear}
            </span>
          )}
          {game.playerNumber && (
            <span className="match-modal__detail-chip">
              <strong>Recomendado:</strong> {formatPlayers(game.playerNumber)}
            </span>
          )}
        </div>
      </section>

      <section className="match-modal__section" aria-labelledby="match-modal-players-info">
        <h3 id="match-modal-players-info">Participantes da mesa ({players.length})</h3>
        {players.length === 0 ? (
          <p className="match-modal__description match-modal__description--empty">
            Nenhum participante adicional registrado nesta mesa.
          </p>
        ) : (
          <ul className="match-modal__players-list">
            {players.map((p) => {
              const isPlayerHost = p.userId === hostId
              const isCurrentUser = p.userId === currentUserId
              return (
                <li key={p.id} className="match-modal__player-item">
                  <span className="match-modal__player-name">{p.name}</span>
                  <div className="match-modal__player-tags">
                    {isPlayerHost && <span className="match-tag match-tag--host">Anfitrião</span>}
                    {isCurrentUser && <span className="match-tag match-tag--you">Você</span>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="match-modal__summary-box">
        <p>
          Partida realizada em <strong>{formattedFullDate}</strong>, com duração de <strong>{formattedDuration}</strong> ({durationMinutes} minutos).
        </p>
      </div>

      <div className="match-modal__footer">
        <Button variant="secondary" className="button--full" onClick={onClose}>
          Fechar detalhes
        </Button>
      </div>
    </Modal>
  )
}
