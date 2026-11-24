import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { useEffect, useState } from 'react'
import { MATCH_TEXT_MAX, type JoinRequest, type OpenMatch } from '../../../models/openMatch'
import { ApiError } from '../../../models/services/apiClient'
import { acceptJoinRequest, listJoinRequests, rejectJoinRequest } from '../../../models/services/openMatchService'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { UserLink } from '../../components/UserLink/UserLink'
import { Modal } from '../../components/Modal/Modal'
import { cx } from '../../utils/classNames'
import './PlayModals.css'

const STATUS_LABEL: Record<JoinRequest['status'], string> = {
  PENDING: 'Aguardando você',
  ACCEPTED: 'Aceito',
  REJECTED: 'Recusado',
  CANCELLED: 'Desistiu',
}

type JoinRequestsModalProps = {
  match: OpenMatch
  onClose: () => void
}

/** O host vê quem pediu para entrar, com a mensagem, e aceita ou recusa (com resposta opcional) */
export function JoinRequestsModal({ match, onClose }: JoinRequestsModalProps) {
  const [requests, setRequests] = useState<JoinRequest[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  // Vagas que sobram: atualiza conforme o host aceita, sem esperar recarregar
  const [seatsLeft, setSeatsLeft] = useState(match.seatsLeft)

  useEffect(() => {
    const controller = new AbortController()
    listJoinRequests(match.id, controller.signal)
      .then(setRequests)
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true)
      })
    return () => controller.abort()
  }, [match.id])

  async function decide(request: JoinRequest, accept: boolean) {
    setBusyId(request.id)
    setError('')
    try {
      const reply = replies[request.id]?.trim() ?? ''
      const updated = accept ? await acceptJoinRequest(request.id, reply) : await rejectJoinRequest(request.id, reply)
      setRequests((list) => list?.map((r) => (r.id === updated.id ? updated : r)) ?? null)
      if (accept) setSeatsLeft((n) => n - 1)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Não deu: a partida lotou ou esse pedido já foi respondido.'
          : 'Não foi possível salvar a decisão. Tente de novo.',
      )
    } finally {
      setBusyId(null)
    }
  }

  const pending = requests?.filter((r) => r.status === 'PENDING') ?? []
  const answered = requests?.filter((r) => r.status !== 'PENDING') ?? []

  return (
    <Modal
      open
      onClose={onClose}
      title="Pedidos"
      lead={`${match.game?.name ?? 'Partida'} em ${match.city} • ${seatsLeft} ${seatsLeft === 1 ? 'vaga' : 'vagas'}`}
      size="lg"
    >
      {error && (
        <div className="play-modal__notice">
          <Alert tone="warn" size="sm" title="Algo deu errado">
            {error}
          </Alert>
        </div>
      )}

      {loadError ? (
        <Alert tone="warn" size="sm" title="Não deu para carregar">
          Feche e abra de novo para tentar outra vez.
        </Alert>
      ) : requests === null ? (
        <LoadingCard compact message="Carregando pedidos…" />
      ) : requests.length === 0 ? (
        <p className="play-modal__muted">Ninguém pediu para entrar ainda.</p>
      ) : (
        <ul className="join-requests">
          {[...pending, ...answered].map((request) => (
            <li key={request.id} className={cx('join-request', `join-request--${request.status.toLowerCase()}`)}>
              <div className="join-request__head">
                <UserLink userId={request.userId}>{request.userName}</UserLink>
                <span className="join-request__status">{STATUS_LABEL[request.status]}</span>
              </div>
              <p className="join-request__message">“{request.message}”</p>
              {request.hostReply && <p className="join-request__reply">Sua resposta: {request.hostReply}</p>}

              {request.status === 'PENDING' && (
                <div className="join-request__decide">
                  <label className="visually-hidden" htmlFor={`reply-${request.id}`}>
                    Resposta para {request.userName} (opcional)
                  </label>
                  <input
                    id={`reply-${request.id}`}
                    className="join-request__reply-input"
                    maxLength={MATCH_TEXT_MAX}
                    placeholder="Resposta opcional (ex.: endereço, horário)"
                    value={replies[request.id] ?? ''}
                    onChange={(e) => setReplies((r) => ({ ...r, [request.id]: e.target.value }))}
                  />
                  <div className="join-request__buttons">
                    <Button
                      type="button"
                      disabled={busyId === request.id || seatsLeft <= 0}
                      title={seatsLeft <= 0 ? 'A partida está lotada' : undefined}
                      onClick={() => decide(request, true)}
                    >
                      Aceitar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busyId === request.id}
                      onClick={() => decide(request, false)}
                    >
                      Recusar
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
