import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useDirectThread } from '../../../controllers/useDirectThread'
import { useChatThread } from '../../../controllers/useMatchChat'
import { CHAT_MESSAGE_MAX, type ChatTarget } from '../../../models/matchChat'
import { Button } from '../../components/Button/Button'
import { UserLink } from '../../components/UserLink/UserLink'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { cx } from '../../utils/classNames'

const time = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

type ChatThreadViewProps = {
  /** Conversa da partida (com {@code target}) ou, com {@code conversationId}, uma conversa direta */
  matchId?: string
  /** null = mesa; senão, a outra pessoa da conversa */
  target?: ChatTarget
  conversationId?: string
  /** Nome da conversa, para o campo e o leitor de tela */
  label: string
  /** Na mesa, cada balão mostra quem mandou */
  showSenderNames: boolean
  /** Partida cancelada: dá para ler, não para mandar */
  readOnly: boolean
  /** Texto no lugar do campo quando não dá para mandar */
  readOnlyText?: string
  emptyText: string
}

/** Uma conversa: balões (os seus à direita) e o campo de envio. Enter envia; Shift+Enter quebra a linha. */
export function ChatThreadView({
  matchId = '',
  target = null,
  conversationId,
  label,
  showSenderNames,
  readOnly,
  readOnlyText = 'Partida encerrada: a conversa fica só para leitura.',
  emptyText,
}: ChatThreadViewProps) {
  const direct = Boolean(conversationId)
  const matchChat = useChatThread(matchId, target, !direct)
  const directChat = useDirectThread(conversationId ?? '', direct)
  const chat = direct ? directChat : matchChat
  // Conversa direta: a outra pessoa pode ter desligado as mensagens diretas
  const locked = readOnly || (direct && directChat.conversation !== null && !directChat.conversation.canSend)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLOListElement>(null)
  const inputId = useId()
  const count = chat.messages.length

  // Sempre mostra a mensagem mais recente
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [count])

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    const body = draft.trim()
    if (!body || chat.sending) return
    if (await chat.send(body)) setDraft('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void submit()
    }
  }

  return (
    <div className="chat-thread">
      {chat.loading ? (
        <LoadingCard compact message="Abrindo a conversa…" />
      ) : chat.error ? (
        <p className="chat-thread__empty">Não deu para carregar a conversa.</p>
      ) : (
        <ol ref={listRef} className="chat-thread__list" aria-label={`Mensagens: ${label}`} aria-live="polite">
          {count === 0 && <li className="chat-thread__empty">{emptyText}</li>}
          {chat.messages.map((message) => (
            <li key={message.id} className={cx('chat-bubble', message.mine && 'chat-bubble--mine')}>
              {showSenderNames && !message.mine && (
                <UserLink userId={message.senderId} variant="plain" className="chat-bubble__sender">
                  {message.senderName}
                </UserLink>
              )}
              <p className="chat-bubble__body">{message.body}</p>
              <time className="chat-bubble__time" dateTime={message.createdAt}>
                {time.format(new Date(message.createdAt))}
              </time>
            </li>
          ))}
        </ol>
      )}

      {locked ? (
        <p className="chat-thread__readonly">
          {readOnly ? readOnlyText : 'Essa pessoa não está aceitando mensagens diretas agora.'}
        </p>
      ) : (
        <form className="chat-composer" onSubmit={submit}>
          <label className="visually-hidden" htmlFor={inputId}>
            Mensagem para {label}
          </label>
          <textarea
            id={inputId}
            className="text-field__input chat-composer__input"
            rows={1}
            maxLength={CHAT_MESSAGE_MAX}
            placeholder="Escreva uma mensagem…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <Button type="submit" disabled={chat.sending || !draft.trim()}>
            {chat.sending ? 'Enviando…' : 'Enviar'}
          </Button>
          {chat.sendError && (
            <p className="chat-composer__error" role="alert">
              {chat.sendError}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
