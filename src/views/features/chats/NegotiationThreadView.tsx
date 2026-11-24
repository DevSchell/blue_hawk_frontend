import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNegotiationThread } from '../../../controllers/useChatInbox'
import { apiUrl } from '../../../models/services/apiClient'
import { NEGOTIATION_MESSAGE_MAX, parseProposedPrice, type NegotiationStatus } from '../../../models/negotiation'
import { Button } from '../../components/Button/Button'
import { UserLink } from '../../components/UserLink/UserLink'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { cx } from '../../utils/classNames'
import { GameCover } from '../boardgames/GameCover'
import { formatPrice } from '../store/format'
import '../play/MatchChat.css'

const time = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const STATUS_LABEL: Record<NegotiationStatus, string> = {
  OPEN: 'Em negociação',
  ACCEPTED: 'Negócio fechado',
  CLOSED: 'Encerrada',
}

/**
 * Conversa de uma negociação da Loja: o anúncio no topo, as mensagens (com as propostas de preço)
 * e o envio. O vendedor aceita uma proposta do comprador direto no balão.
 */
export function NegotiationThreadView({ negotiationId }: { negotiationId: string }) {
  const thread = useNegotiationThread(negotiationId)
  const [draft, setDraft] = useState('')
  const [price, setPrice] = useState('')
  const [priceError, setPriceError] = useState<string | null>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const inputId = useId()
  const priceId = useId()
  const count = thread.messages.length

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [count])

  if (thread.loading) return <LoadingCard compact message="Abrindo a negociação…" />
  if (thread.error || !thread.negotiation) {
    return <p className="chat-thread__empty">Não deu para abrir esta negociação.</p>
  }

  const { negotiation } = thread
  const other = negotiation.isSeller ? negotiation.buyer : negotiation.seller
  const open = negotiation.status === 'OPEN'
  // Depois do aceite, a conversa continua (para combinar a entrega), mas sem novas propostas
  const canWrite = negotiation.status !== 'CLOSED'
  const game = negotiation.offer.game

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    const body = draft.trim()
    const parsed = open ? parseProposedPrice(price) : { value: null, error: null }
    setPriceError(parsed.error)
    if (!body || parsed.error || thread.sending) return
    if (await thread.send(body, parsed.value)) {
      setDraft('')
      setPrice('')
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void submit()
    }
  }

  return (
    <div className="negotiation">
      <header className="negotiation__offer">
        <div className="negotiation__cover">
          <GameCover
            id={game.id}
            name={game.name}
            preset={game.coverPreset}
            imageUrl={game.coverImageUrl ? apiUrl(game.coverImageUrl) : null}
          />
        </div>
        <div className="negotiation__info">
          <b className="negotiation__game">{game.name}</b>
          <span className="negotiation__who">
            {negotiation.isSeller ? 'Vendendo para' : 'Comprando de'}{' '}
            <UserLink userId={other.id}>{other.name}</UserLink>
          </span>
          <span className="negotiation__price">
            Anunciado por {formatPrice(negotiation.offer.price)}
            {negotiation.agreedPrice !== null && (
              <>
                {' '}
                · fechado por <b>{formatPrice(negotiation.agreedPrice)}</b>
              </>
            )}
          </span>
        </div>
        <span
          className={cx('badge', 'negotiation__status', `negotiation__status--${negotiation.status.toLowerCase()}`)}
        >
          {STATUS_LABEL[negotiation.status]}
        </span>
      </header>

      <ol ref={listRef} className="chat-thread__list" aria-label={`Negociação com ${other.name}`} aria-live="polite">
        {count === 0 && <li className="chat-thread__empty">Nenhuma mensagem ainda.</li>}
        {thread.messages.map((message) => (
          <li key={message.id} className={cx('chat-bubble', message.mine && 'chat-bubble--mine')}>
            {message.proposedPrice !== null && (
              <span className="negotiation__proposal">Proposta: {formatPrice(message.proposedPrice)}</span>
            )}
            <p className="chat-bubble__body">{message.body}</p>
            <time className="chat-bubble__time" dateTime={message.createdAt}>
              {time.format(new Date(message.createdAt))}
            </time>
            {negotiation.isSeller && open && !message.mine && message.proposedPrice !== null && (
              <Button
                type="button"
                variant="secondary"
                className="negotiation__accept"
                disabled={thread.sending}
                onClick={() => thread.accept(message.id)}
              >
                Aceitar {formatPrice(message.proposedPrice)}
              </Button>
            )}
          </li>
        ))}
      </ol>

      {thread.actionError && (
        <p className="chat-composer__error" role="alert">
          {thread.actionError}
        </p>
      )}

      {negotiation.status === 'ACCEPTED' && (
        <p className="negotiation__deal">
          Negócio fechado por <b>{formatPrice(negotiation.agreedPrice ?? negotiation.offer.price)}</b>. Combinem a
          entrega por aqui.
        </p>
      )}

      {canWrite ? (
        <form className={cx('negotiation__composer', !open && 'negotiation__composer--no-price')} onSubmit={submit}>
          <label className="visually-hidden" htmlFor={inputId}>
            Mensagem para {other.name}
          </label>
          <textarea
            id={inputId}
            className="text-field__input chat-composer__input"
            rows={1}
            maxLength={NEGOTIATION_MESSAGE_MAX}
            placeholder="Escreva uma mensagem…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          {open && (
            <label className="negotiation__price-field" htmlFor={priceId}>
              <span>R$</span>
              <input
                id={priceId}
                className="text-field__input"
                inputMode="decimal"
                placeholder={negotiation.isSeller ? 'Contraproposta' : 'Proposta'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-describedby={priceError ? `${priceId}-erro` : undefined}
              />
            </label>
          )}
          <Button type="submit" disabled={thread.sending || !draft.trim()}>
            {thread.sending ? 'Enviando…' : 'Enviar'}
          </Button>
          {priceError && (
            <p id={`${priceId}-erro`} className="chat-composer__error" role="alert">
              {priceError}
            </p>
          )}
        </form>
      ) : (
        <p className="chat-thread__readonly">Esta negociação foi encerrada: o jogo foi vendido para outra pessoa.</p>
      )}
    </div>
  )
}
