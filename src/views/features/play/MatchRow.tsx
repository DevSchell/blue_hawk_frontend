import type { OpenMatch } from '../../../models/openMatch'
import { MapPinIcon, UsersIcon } from '../../components/Icons/Icons'
import { cx } from '../../utils/classNames'
import { matchDateParts } from './format'
import { MatchActions, type MatchActionHandlers } from './MatchActions'
import './MatchRow.css'

type MatchRowProps = MatchActionHandlers & {
  match: OpenMatch
  /** Abre a modal da partida (detalhes e chats) */
  onOpen: (match: OpenMatch) => void
}

/** Uma partida em formato de linha (Minhas partidas): data, jogo, cidade, vagas e a ação */
export function MatchRow({ match, onOpen, ...actions }: MatchRowProps) {
  const date = matchDateParts(match.scheduledAt)
  const cancelled = match.status === 'CANCELLED'

  return (
    <li className={cx('match-row', cancelled && 'match-row--cancelled', match.isHost && 'match-row--host')}>
      <div className="match-row__date">
        <span className="match-row__day">{date.day}</span>
        <span className="match-row__month">{date.month}</span>
      </div>

      <div className="match-row__info">
        <h3 className="match-row__title">
          <button type="button" className="match-row__open" onClick={() => onOpen(match)}>
            {match.game?.name ?? 'Jogo removido'}
          </button>
          {match.isHost && <span className="badge match-row__host-badge">Você hospeda</span>}
        </h3>
        <p className="match-row__meta">
          <span>
            {date.weekday}, {date.time}
          </span>
          <span className="match-row__meta-item">
            <MapPinIcon />
            {match.city}
          </span>
          {!match.isHost && <span>com {match.host.name}</span>}
        </p>
      </div>

      <span className="match-row__seats" aria-label={`${match.players} de ${match.maxPlayers} jogadores`}>
        <UsersIcon />
        {match.players}/{match.maxPlayers}
      </span>

      <div className="match-row__actions">
        <MatchActions match={match} {...actions} />
      </div>
    </li>
  )
}
