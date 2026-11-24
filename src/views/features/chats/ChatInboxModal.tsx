import { useState } from 'react'
import { useInbox } from '../../../controllers/useChatInbox'
import { filterInbox, type ChatInboxFilter, type ChatInboxItem } from '../../../models/chatInbox'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ChatIcon, D20Icon, UsersIcon } from '../../components/Icons/Icons'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { UserLink } from '../../components/UserLink/UserLink'
import { Modal } from '../../components/Modal/Modal'
import { PillTabs } from '../../components/PillTabs/PillTabs'
import { cx } from '../../utils/classNames'
import { ChatThreadView } from '../play/ChatThreadView'
import { NegotiationThreadView } from './NegotiationThreadView'
import { matchPath } from '../../layout/navigation'
import './Chats.css'

const FILTERS: { id: ChatInboxFilter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'mesas', label: 'Mesas' },
  { id: 'negociacoes', label: 'Negociações' },
  { id: 'diretas', label: 'Diretas' },
]

const STATUS_LABEL: Partial<Record<ChatInboxItem['status'], string>> = {
  CANCELLED: 'Cancelada',
  ACCEPTED: 'Negócio fechado',
  CLOSED: 'Encerrada',
  PENDING: 'Pedido pendente',
  REJECTED: 'Recusado',
}

const when = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

type ChatInboxModalProps = {
  /** Conversa para abrir direto (ex.: "neg:{id}") */
  initialKey?: string
  initialFilter?: ChatInboxFilter
  onClose: () => void
}

/**
 * Caixa de conversas: chats das mesas (Jogue) e negociações (Loja) num lugar só.
 * Lista com filtro; escolher uma conversa abre ela aqui mesmo, com "voltar" para a lista.
 */
export function ChatInboxModal({ initialKey, initialFilter = 'todas', onClose }: ChatInboxModalProps) {
  const inbox = useInbox(true)
  const [filter, setFilter] = useState<ChatInboxFilter>(initialFilter)
  const [openKey, setOpenKey] = useState<string | null>(initialKey ?? null)

  const items = inbox.items ?? []
  // A conversa pedida pode ainda não estar na lista (acabou de ser criada): abre pelo próprio id
  const openItem = openKey ? (items.find((i) => i.key === openKey) ?? itemFromKey(openKey)) : null
  const visible = filterInbox(items, filter)
  const unreadIn = (f: ChatInboxFilter) => filterInbox(items, f).reduce((sum, i) => sum + i.unread, 0)

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={openItem ? openItem.title || 'Conversa' : 'Conversas'}
      lead={openItem ? openItem.subtitle : 'Mesas do Jogue, negociações da Loja e conversas diretas.'}
    >
      {openItem ? (
        <div className="inbox-thread">
          <div className="inbox-thread__bar">
            <button type="button" className="inbox-thread__back" onClick={() => setOpenKey(null)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
              Conversas
            </button>
            {openItem.withUserId && (
              <UserLink userId={openItem.withUserId} className="inbox-thread__link">
                Ver perfil
              </UserLink>
            )}
            {openItem.matchId && (
              <a className="inbox-thread__link" href={matchPath(openItem.matchId)}>
                Abrir partida
              </a>
            )}
          </div>
          {openItem.directConversationId ? (
            <ChatThreadView
              key={openItem.key}
              conversationId={openItem.directConversationId}
              label={openItem.title}
              showSenderNames={false}
              readOnly={false}
              emptyText="Nenhuma mensagem ainda. Diga um oi!"
            />
          ) : openItem.negotiationId ? (
            <NegotiationThreadView key={openItem.key} negotiationId={openItem.negotiationId} />
          ) : openItem.matchId ? (
            <ChatThreadView
              key={openItem.key}
              matchId={openItem.matchId}
              target={openItem.withUserId}
              label={openItem.subtitle || openItem.title}
              showSenderNames={openItem.kind === 'MATCH_TABLE'}
              readOnly={openItem.status === 'CANCELLED'}
              emptyText="Nenhuma mensagem ainda. Puxe assunto!"
            />
          ) : null}
        </div>
      ) : (
        <>
          <PillTabs<ChatInboxFilter>
            label="Filtrar conversas"
            tabs={FILTERS.map((f) => ({ ...f, badge: unreadIn(f.id) || undefined }))}
            value={filter}
            onChange={setFilter}
          />

          {inbox.loading ? (
            <LoadingCard compact message="Buscando conversas…" />
          ) : inbox.error ? (
            <div className="inbox__error">
              <p>Não deu para carregar as conversas.</p>
              <Button type="button" variant="secondary" onClick={inbox.reload}>
                Tentar de novo
              </Button>
            </div>
          ) : visible.length === 0 ? (
            <EmptyState icon={<Raven variant="noite" />} title="Nenhuma conversa por aqui">
              {filter === 'negociacoes'
                ? 'Abra um anúncio na Loja e mande uma proposta ao vendedor.'
                : filter === 'diretas'
                  ? 'Abra o perfil de alguém e toque em “Iniciar conversa”.'
                  : 'Peça vaga numa partida do Jogue ou hospede a sua para conversar com a mesa.'}
            </EmptyState>
          ) : (
            <ul className="inbox__list">
              {visible.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className={cx('inbox-item', item.unread > 0 && 'is-unread')}
                    onClick={() => setOpenKey(item.key)}
                  >
                    <span
                      className={cx('inbox-item__icon', item.kind === 'NEGOTIATION' && 'is-deal')}
                      aria-hidden="true"
                    >
                      {item.kind === 'NEGOTIATION' ? (
                        <D20Icon />
                      ) : item.kind === 'DIRECT' ? (
                        <ChatIcon />
                      ) : (
                        <UsersIcon />
                      )}
                    </span>
                    <span className="inbox-item__main">
                      <span className="inbox-item__head">
                        <b className="inbox-item__title">{item.title}</b>
                        <time dateTime={item.lastActivityAt}>{when.format(new Date(item.lastActivityAt))}</time>
                      </span>
                      <span className="inbox-item__subtitle">
                        {item.subtitle}
                        {STATUS_LABEL[item.status] && (
                          <span className="inbox-item__status"> · {STATUS_LABEL[item.status]}</span>
                        )}
                      </span>
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
          )}
        </>
      )}
    </Modal>
  )
}

/** Monta um item mínimo a partir da chave, para abrir uma conversa que ainda não veio na lista */
function itemFromKey(key: string): ChatInboxItem | null {
  const base = { title: '', subtitle: '', unread: 0, lastActivityAt: new Date().toISOString(), lastMessage: null }
  if (key.startsWith('dm:')) {
    return {
      ...base,
      key,
      kind: 'DIRECT',
      matchId: null,
      withUserId: null,
      negotiationId: null,
      directConversationId: key.slice(3),
      status: 'OPEN',
    }
  }
  if (key.startsWith('neg:')) {
    return {
      ...base,
      key,
      kind: 'NEGOTIATION',
      matchId: null,
      withUserId: null,
      negotiationId: key.slice(4),
      status: 'OPEN',
    }
  }
  const match = /^match:([^:]+):(.+)$/.exec(key)
  if (!match) return null
  const [, matchId, who] = match
  return {
    ...base,
    key,
    kind: who === 'table' ? 'MATCH_TABLE' : 'MATCH_DIRECT',
    matchId,
    withUserId: who === 'table' ? null : who,
    negotiationId: null,
    status: 'OPEN',
  }
}
