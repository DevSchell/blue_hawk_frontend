import type { ChatInboxItem } from '../../../models/chatInbox'
import { cx } from '../../utils/classNames'
import '../chats/Chats.css'

const STATUS_LABEL: Partial<Record<ChatInboxItem['status'], string>> = {
  OPEN: 'Em negociação',
  ACCEPTED: 'Negócio fechado',
  CLOSED: 'Encerrada',
}

const when = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

type NegotiationListProps = {
  items: ChatInboxItem[]
  /** Abre a conversa na caixa de chats */
  onOpen: (key: string) => void
}

/** "Minhas negociações" da Loja: compras e vendas em andamento, que abrem na caixa de conversas */
export function NegotiationList({ items, onOpen }: NegotiationListProps) {
  return (
    <ul className="inbox__list store-negotiations">
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            className={cx('inbox-item', item.unread > 0 && 'is-unread')}
            onClick={() => onOpen(item.key)}
          >
            <span className={cx('badge', 'store-negotiations__status', `is-${item.status.toLowerCase()}`)}>
              {STATUS_LABEL[item.status] ?? item.status}
            </span>
            <span className="inbox-item__main">
              <span className="inbox-item__head">
                <b className="inbox-item__title">{item.title}</b>
                <time dateTime={item.lastActivityAt}>{when.format(new Date(item.lastActivityAt))}</time>
              </span>
              <span className="inbox-item__subtitle">{item.subtitle}</span>
              <span className="inbox-item__preview">
                {item.lastMessage
                  ? `${item.lastMessage.mine ? 'Você' : item.lastMessage.senderName}: ${item.lastMessage.body}`
                  : 'Sem mensagens ainda'}
              </span>
            </span>
            {item.unread > 0 && (
              <span className="inbox-item__unread" aria-label={`${item.unread} não lidas`}>
                {item.unread}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}
