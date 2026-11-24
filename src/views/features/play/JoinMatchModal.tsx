import { useId, useState, type FormEvent } from 'react'
import { MATCH_TEXT_MAX, type OpenMatch } from '../../../models/openMatch'
import { ApiError } from '../../../models/services/apiClient'
import { requestToJoin } from '../../../models/services/openMatchService'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { formatMatchDate } from './format'
import { FormActions } from '../../components/FormActions/FormActions'
import '../auth/AuthForm.css'
import './PlayModals.css'

type JoinMatchModalProps = {
  match: OpenMatch
  onJoined: (updated: OpenMatch) => void
  onClose: () => void
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return 'Essa partida não aceita mais pedidos (lotou, foi cancelada ou o host já respondeu).'
    if (error.status === 401) return 'Sua sessão expirou. Entre de novo para continuar.'
    return `O servidor respondeu com erro (${error.status}). Tente de novo.`
  }
  return 'Não foi possível conectar ao servidor.'
}

/** Pedir para entrar: uma mensagem para o host, que aprova ou recusa (estilo carona) */
export function JoinMatchModal({ match, onJoined, onClose }: JoinMatchModalProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messageId = useId()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    if (!message.trim()) {
      setError(`Escreva uma mensagem para ${match.host.name}.`)
      return
    }
    setSending(true)
    setError('')
    try {
      onJoined(await requestToJoin(match.id, message.trim()))
    } catch (err) {
      setError(errorMessage(err))
      setSending(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Pedir para entrar"
      lead={`${match.game?.name ?? 'Partida'} • ${match.city} • ${formatMatchDate(match.scheduledAt)}`}
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <Alert tone="warn" size="sm" title="Não deu para enviar">
            {error}
          </Alert>
        )}
        <div className="text-field">
          <label htmlFor={messageId}>Mensagem para {match.host.name}</label>
          <div className="text-field__control">
            <textarea
              id={messageId}
              className="text-field__input play-modal__textarea"
              rows={4}
              maxLength={MATCH_TEXT_MAX}
              placeholder="Conte um pouco: se já jogou, se vai com alguém, se pode levar algo…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-autofocus
            />
          </div>
          <small className="text-field__hint">
            {match.host.name} vê sua mensagem e decide. A resposta aparece em “Minhas partidas”.
          </small>
        </div>
        <FormActions onCancel={onClose} busy={sending}>
          <Button type="submit" disabled={sending}>
            {sending ? 'Enviando…' : 'Enviar pedido'}
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
