import type { ReactNode } from 'react'
import { useNotificationList } from '../../../controllers/useNotifications'
import { notificationHref, notificationText, type AppNotification, type NotificationType } from '../../../models/notification'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ChatIcon, CheckIcon, CloseIcon, D20Icon, LogoutIcon, ShieldCheckIcon, UsersIcon } from '../../components/Icons/Icons'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { Modal } from '../../components/Modal/Modal'
import { cx } from '../../utils/classNames'
import { navigate } from '../../layout/router'

const ICONS: Record<NotificationType, ReactNode> = {
  JOIN_REQUEST_RECEIVED: <UsersIcon />,
  JOIN_REQUEST_WITHDRAWN: <LogoutIcon />,
  JOIN_REQUEST_ACCEPTED: <CheckIcon />,
  JOIN_REQUEST_REJECTED: <CloseIcon />,
  MATCH_CANCELLED: <CloseIcon />,
  MATCH_MESSAGE: <D20Icon />,
  BOARDGAME_APPROVED: <ShieldCheckIcon />,
  BOARDGAME_REJECTED: <ShieldCheckIcon />,
  OFFER_MESSAGE: <ChatIcon />,
  OFFER_ACCEPTED: <CheckIcon />,
}

const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

/** "agora", "há 5 minutos", "ontem"… */
function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000)
  if (Math.abs(minutes) < 1) return 'agora'
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
  return relative.format(Math.round(hours / 24), 'day')
}

/** Lista de notificações: clicar marca como lida e leva ao lugar dela (ex.: o chat da partida) */
export function NotificationsModal({ onClose }: { onClose: () => void }) {
  const list = useNotificationList()
  const hasUnread = list.items.some((n) => !n.read)

  async function open(notification: AppNotification) {
    await list.markRead(notification)
    navigate(notificationHref(notification))
  }

  return (
    <Modal open onClose={onClose} title="Notificações" lead="Pedidos, respostas e mensagens das suas partidas.">
      {hasUnread && (
        <div className="notifications__toolbar">
          <Button type="button" variant="link" onClick={list.markAllRead}>
            Marcar todas como lidas
          </Button>
        </div>
      )}

      {list.loading && list.items.length === 0 ? (
        <LoadingCard compact message="Buscando notificações…" />
      ) : list.error && list.items.length === 0 ? (
        <div className="notifications__error">
          <p>Não deu para carregar as notificações.</p>
          <Button type="button" variant="secondary" onClick={list.retry}>
            Tentar de novo
          </Button>
        </div>
      ) : list.items.length === 0 ? (
        <EmptyState icon={<Raven variant="noite" />} title="Tudo em dia">
          Quando alguém pedir vaga, responder ou mandar mensagem, aparece aqui.
        </EmptyState>
      ) : (
        <ul className="notifications__list">
          {list.items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={cx('notification-item', !n.read && 'is-unread')}
                onClick={() => open(n)}
              >
                <span className="notification-item__icon">{ICONS[n.type]}</span>
                <span className="notification-item__text">
                  {notificationText(n)}
                  <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
                </span>
                {!n.read && <span className="visually-hidden">(não lida)</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {list.hasMore && (
        <div className="notifications__more">
          <Button type="button" variant="secondary" disabled={list.loading} onClick={list.loadMore}>
            {list.loading ? 'Carregando…' : 'Ver mais antigas'}
          </Button>
        </div>
      )}
    </Modal>
  )
}
