import type { OpenMatch } from '../../../models/openMatch'
import { apiUrl } from '../../../models/services/apiClient'
import { Button } from '../../components/Button/Button'
import { ClockIcon, MapPinIcon } from '../../components/Icons/Icons'
import { cx } from '../../utils/classNames'
import { GameCover } from '../boardgames/GameCover'
import { matchDateParts } from './format'
import './MatchCard.css'

type MatchCardProps = {
  match: OpenMatch
  signedIn: boolean
  busy: boolean
  onSignIn: () => void
  onJoin: (match: OpenMatch) => void
  onWithdraw: (match: OpenMatch) => void
  onOpenRequests: (match: OpenMatch) => void
  onCancel: (match: OpenMatch) => void
}

/** Uma partida do matchmaking, com a ação certa para quem está vendo (visitante, interessado ou host) */
export function MatchCard({
  match,
  signedIn,
  busy,
  onSignIn,
  onJoin,
  onWithdraw,
  onOpenRequests,
  onCancel,
}: MatchCardProps) {
  const date = matchDateParts(match.scheduledAt)
  const cancelled = match.status === 'CANCELLED'
  const full = match.seatsLeft <= 0
  const request = match.myRequest
  const game = match.game

  return (
    <article className={cx('match-card', cancelled && 'match-card--cancelled', match.isHost && 'match-card--host')}>
      <div className="match-card__media">
        {game && (
          <GameCover
            id={game.id}
            name={game.name}
            preset={game.coverPreset}
            imageUrl={game.coverImageUrl ? apiUrl(game.coverImageUrl) : null}
          />
        )}
        <div className="match-card__date" aria-hidden="true">
          <span className="match-card__weekday">{date.weekday}</span>
          <span className="match-card__day">{date.day}</span>
          <span className="match-card__month">{date.month}</span>
        </div>
        {match.isHost && <span className="match-card__badge">Você hospeda</span>}
      </div>

      <div className="match-card__body">
        <h3 className="match-card__title">{game?.name ?? 'Jogo removido'}</h3>
        {game?.category && <span className="match-card__category">{game.category}</span>}

        <ul className="match-card__facts">
          <li>
            <MapPinIcon />
            <span>{match.city}</span>
          </li>
          <li>
            <ClockIcon />
            <span>
              <span className="visually-hidden">
                {date.weekday}, {date.day} de {date.month},{' '}
              </span>
              {date.time}
              {game?.playTime ? ` • ~${game.playTime} min` : ''}
            </span>
          </li>
        </ul>

        <p className="match-card__host">
          Hospedado por <b>{match.isHost ? 'você' : match.host.name}</b>
        </p>

        <div className="match-card__seats" aria-label={`${match.players} de ${match.maxPlayers} jogadores`}>
          <span className="match-card__dots" aria-hidden="true">
            {Array.from({ length: match.maxPlayers }, (_, i) => (
              <span key={i} className={cx('match-card__dot', i < match.players && 'is-taken')} />
            ))}
          </span>
          <span className="match-card__seats-text">
            {full ? 'Mesa completa' : `${match.seatsLeft} ${match.seatsLeft === 1 ? 'vaga' : 'vagas'}`}
          </span>
        </div>

        {match.notes && <p className="match-card__notes">{match.notes}</p>}

        {request?.hostReply && (request.status === 'ACCEPTED' || request.status === 'REJECTED') && (
          <p className="match-card__reply">
            <b>{match.host.name}:</b> {request.hostReply}
          </p>
        )}

        <div className="match-card__actions">
          {cancelled ? (
            <span className="match-card__state match-card__state--muted">
              {match.isHost ? 'Você cancelou' : 'Cancelada pelo host'}
            </span>
          ) : match.isHost ? (
            <>
              <Button type="button" onClick={() => onOpenRequests(match)}>
                Pedidos{match.pendingRequests ? ` (${match.pendingRequests})` : ''}
              </Button>
              <Button type="button" variant="link" disabled={busy} onClick={() => onCancel(match)}>
                Cancelar partida
              </Button>
            </>
          ) : request?.status === 'PENDING' ? (
            <>
              <span className="match-card__state">Aguardando o host</span>
              <Button type="button" variant="link" disabled={busy} onClick={() => onWithdraw(match)}>
                Desistir
              </Button>
            </>
          ) : request?.status === 'ACCEPTED' ? (
            <>
              <span className="match-card__state match-card__state--ok">Você está dentro!</span>
              <Button type="button" variant="link" disabled={busy} onClick={() => onWithdraw(match)}>
                Desistir
              </Button>
            </>
          ) : request?.status === 'REJECTED' ? (
            <span className="match-card__state match-card__state--muted">Pedido recusado</span>
          ) : !signedIn ? (
            <Button type="button" variant="secondary" onClick={onSignIn}>
              Entre para pedir vaga
            </Button>
          ) : full ? (
            <span className="match-card__state match-card__state--muted">Lotada</span>
          ) : (
            <Button type="button" onClick={() => onJoin(match)}>
              Pedir para entrar
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
