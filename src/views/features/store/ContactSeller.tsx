import { useId, useState, type FormEvent } from 'react'
import { negotiationKey, openChatInbox } from '../../../models/chatInbox'
import { requestLogin } from '../../../models/loginPrompt'
import { NEGOTIATION_MESSAGE_MAX } from '../../../models/negotiation'
import { ApiError } from '../../../models/services/apiClient'
import { startNegotiation } from '../../../models/services/negotiationService'
import { readUserId } from '../../../models/session'
import type { StoreOffer } from '../../../models/store'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { UserLink } from '../../components/UserLink/UserLink'
import './ContactSeller.css'

/**
 * Primeiro contato com quem vende: só a mensagem, sem proposta de preço. A ideia é valorizar o jogo
 * antigo: primeiro conhecer o exemplar e quem vende; as propostas vêm depois, dentro da conversa.
 */
export function ContactSeller({ offer }: { offer: StoreOffer }) {
  const signedIn = Boolean(readUserId())
  const [message, setMessage] = useState('Olá! O jogo ainda está disponível? Queria saber mais sobre este exemplar.')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messageId = useId()

  if (!signedIn) {
    return (
      <section className="contact-seller" aria-label="Falar com quem vende">
        <p>Entre na sua conta para conversar com {offer.sellerName} sobre este exemplar.</p>
        <Button type="button" onClick={requestLogin}>
          Entrar para negociar
        </Button>
      </section>
    )
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const body = message.trim()
    if (!body) return setError('Escreva uma mensagem para o vendedor.')
    setSending(true)
    setError(null)
    try {
      const negotiation = await startNegotiation(offer.id, body, null)
      setSending(false)
      openChatInbox({ key: negotiationKey(negotiation.id) })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Este anúncio não está mais disponível para negociar.'
          : 'Não deu para enviar. Tente de novo.',
      )
      setSending(false)
    }
  }

  return (
    <form id="falar-com-quem-vende" className="contact-seller" onSubmit={submit} noValidate>
      <h3>
        Falar com <UserLink userId={offer.sellerId}>{offer.sellerName}</UserLink>
      </h3>
      <p className="contact-seller__lead">
        Conheça o exemplar e a história dele antes de falar em preço. As propostas ficam para a conversa.
      </p>
      {error && (
        <Alert tone="warn" size="sm" title="Ops">
          {error}
        </Alert>
      )}
      <div className="text-field">
        <label htmlFor={messageId}>Mensagem</label>
        <textarea
          id={messageId}
          className="text-field__input contact-seller__message"
          rows={3}
          maxLength={NEGOTIATION_MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={sending}>
        {sending ? 'Enviando…' : 'Entrar em contato'}
      </Button>
    </form>
  )
}
