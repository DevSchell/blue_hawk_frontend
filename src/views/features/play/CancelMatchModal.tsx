import { useId, useState, type FormEvent } from 'react'
import { CANCEL_REASON_MAX, CANCEL_REASON_MIN, type OpenMatch } from '../../../models/openMatch'
import { ApiError } from '../../../models/services/apiClient'
import { cancelMatch } from '../../../models/services/openMatchService'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { FormActions } from '../../components/FormActions/FormActions'
import { Modal } from '../../components/Modal/Modal'
import { cx } from '../../utils/classNames'
import { formatMatchDate } from './format'
import '../auth/AuthForm.css'
import './PlayModals.css'

type CancelMatchModalProps = {
  match: OpenMatch
  onCancelled: (updated: OpenMatch) => void
  onClose: () => void
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return `Explique o motivo com ${CANCEL_REASON_MIN} a ${CANCEL_REASON_MAX} caracteres.`
    if (error.status === 409) return 'Essa partida já foi cancelada.'
    if (error.status === 401) return 'Sua sessão expirou. Entre de novo para continuar.'
    return `O servidor respondeu com erro (${error.status}). Tente de novo.`
  }
  return 'Não foi possível conectar ao servidor.'
}

/** Confirmação do cancelamento: o host explica o motivo, que vai na notificação de quem pediu vaga */
export function CancelMatchModal({ match, onCancelled, onClose }: CancelMatchModalProps) {
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const reasonId = useId()
  const length = reason.trim().length
  const affected = match.players - 1 + (match.pendingRequests ?? 0)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    if (length < CANCEL_REASON_MIN) {
      setError(`Explique o motivo com pelo menos ${CANCEL_REASON_MIN} caracteres.`)
      return
    }
    setSending(true)
    setError('')
    try {
      onCancelled(await cancelMatch(match.id, reason.trim()))
    } catch (err) {
      setError(errorMessage(err))
      setSending(false)
    }
  }

  return (
    <Modal
      open
      onClose={() => !sending && onClose()}
      title="Cancelar a partida?"
      lead={`${match.game?.name ?? 'Partida'} • ${match.city} • ${formatMatchDate(match.scheduledAt)}`}
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <Alert tone="warn" size="sm" title="Não dá para desfazer">
          {affected > 0
            ? `${affected === 1 ? 'Quem pediu vaga recebe' : `As ${affected} pessoas que pediram vaga recebem`} uma notificação com o motivo, e os chats ficam só para leitura.`
            : 'Ninguém pediu vaga ainda. A partida sai da lista e os chats ficam só para leitura.'}
        </Alert>
        {error && (
          <Alert tone="warn" size="sm" title="Não deu para cancelar">
            {error}
          </Alert>
        )}
        <div className="text-field">
          <label htmlFor={reasonId}>Motivo do cancelamento</label>
          <div className="text-field__control">
            <textarea
              id={reasonId}
              className="text-field__input play-modal__textarea"
              rows={3}
              maxLength={CANCEL_REASON_MAX}
              placeholder="Ex.: surgiu um imprevisto e não vou conseguir receber a mesa nesse dia."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-describedby={`${reasonId}-hint`}
              data-autofocus
            />
          </div>
          <small
            id={`${reasonId}-hint`}
            className={cx('text-field__hint', length > 0 && length < CANCEL_REASON_MIN && 'is-short')}
          >
            {length < CANCEL_REASON_MIN
              ? `Mínimo de ${CANCEL_REASON_MIN} caracteres. Os jogadores veem esse texto.`
              : `${length}/${CANCEL_REASON_MAX}`}
          </small>
        </div>
        <FormActions onCancel={onClose} cancelLabel="Voltar" busy={sending}>
          <Button type="submit" disabled={sending}>
            {sending ? 'Cancelando…' : 'Cancelar partida'}
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
