import type { OpenMatch } from '../../../models/openMatch'
import { Button } from '../../components/Button/Button'

export type MatchActionHandlers = {
  signedIn: boolean
  busy: boolean
  onSignIn: () => void
  onJoin: (match: OpenMatch) => void
  onWithdraw: (match: OpenMatch) => void
  onOpenRequests: (match: OpenMatch) => void
  onCancel: (match: OpenMatch) => void
}

/**
 * A ação certa para quem está vendo a partida (visitante, interessado ou host). Usada no card, na lista e na página.
 * Desistir só aparece na página da partida ({@code showWithdraw}); no card e na lista fica só a situação do pedido.
 */
export function MatchActions({
  match,
  signedIn,
  busy,
  onSignIn,
  onJoin,
  onWithdraw,
  onOpenRequests,
  onCancel,
  showWithdraw = false,
}: MatchActionHandlers & { match: OpenMatch; showWithdraw?: boolean }) {
  const cancelled = match.status === 'CANCELLED'
  const full = match.seatsLeft <= 0
  const request = match.myRequest

  if (cancelled) {
    return (
      <span className="match-card__state match-card__state--muted">
        {match.isHost ? 'Você cancelou' : 'Cancelada pelo host'}
      </span>
    )
  }
  if (match.isHost) {
    return (
      <>
        <Button type="button" size="sm" onClick={() => onOpenRequests(match)}>
          Pedidos{match.pendingRequests ? ` (${match.pendingRequests})` : ''}
        </Button>
        <Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => onCancel(match)}>
          Cancelar partida
        </Button>
      </>
    )
  }
  if (request?.status === 'PENDING' || request?.status === 'ACCEPTED') {
    const accepted = request.status === 'ACCEPTED'
    return (
      <>
        <span className={accepted ? 'badge match-state match-state--in' : 'badge badge--outline match-state'}>
          {accepted ? 'Você está dentro!' : 'Aguardando o host'}
        </span>
        {showWithdraw && (
          <Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => onWithdraw(match)}>
            Desistir
          </Button>
        )}
      </>
    )
  }
  if (request?.status === 'REJECTED') {
    return <span className="match-card__state match-card__state--muted">Pedido recusado</span>
  }
  if (!signedIn) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={onSignIn}>
        Entre para pedir vaga
      </Button>
    )
  }
  if (full) return <span className="match-card__state match-card__state--muted">Lotada</span>
  return (
    <Button type="button" size="sm" onClick={() => onJoin(match)}>
      Pedir para entrar
    </Button>
  )
}
