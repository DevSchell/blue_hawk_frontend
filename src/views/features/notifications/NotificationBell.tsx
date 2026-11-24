import { useEffect, useState } from 'react'
import { useUnreadCount } from '../../../controllers/useNotifications'
import { IconButton } from '../../components/IconButton/IconButton'
import { BellIcon } from '../../components/Icons/Icons'
import { NotificationsModal } from './NotificationsModal'
import { onNavigation } from '../../layout/router'
import './Notifications.css'

/** Sininho da topbar, ao lado da foto: mostra quantas não lidas e abre a modal de notificações */
export function NotificationBell({ signedIn }: { signedIn: boolean }) {
  const unread = useUnreadCount(signedIn)
  const [open, setOpen] = useState(false)
  // Seguir uma notificação troca de tela: o modal fecha
  useEffect(() => onNavigation(() => setOpen(false)), [])

  if (!signedIn) return null

  const label = unread.count > 0 ? `Notificações: ${unread.count} não lidas` : 'Notificações'

  return (
    <>
      <span className="notification-bell">
        <IconButton label={label} variant="ghost" aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <BellIcon />
        </IconButton>
        {unread.count > 0 && (
          <span className="notification-bell__count" aria-hidden="true">
            {unread.count > 99 ? '99+' : unread.count}
          </span>
        )}
      </span>
      {open && (
        <NotificationsModal
          onClose={() => {
            setOpen(false)
            unread.refresh()
          }}
        />
      )}
    </>
  )
}
