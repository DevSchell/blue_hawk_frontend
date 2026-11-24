import { useCallback, useEffect, useState } from 'react'
import type { AppNotification } from '../models/notification'
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../models/services/notificationService'

/** Polling de reserva do sininho (com o tempo real, o aviso chega na hora via NOTIFICATIONS_CHANGED) */
const UNREAD_POLL_MS = 30000
/** Avisa o sininho que algo foi lido em outro lugar (ex.: abrir um chat) */
export const NOTIFICATIONS_CHANGED = 'bluehawk:notifications-changed'

/** Contador do sininho: busca ao abrir, a cada 30 s com a aba visível e quando a aba volta ao foco */
export function useUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0)

  const refresh = useCallback(() => {
    if (!enabled) return
    getUnreadCount()
      .then((result) => setCount(result.count))
      .catch(() => undefined)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    refresh()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, UNREAD_POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh)
    }
  }, [enabled, refresh])

  return { count: enabled ? count : 0, refresh }
}

/** Lista da modal de notificações, com "carregar mais" e marcar como lida */
export function useNotificationList() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listNotifications(page, controller.signal)
      .then((batch) => {
        setItems((prev) => (page === 0 ? batch : [...prev, ...batch.filter((n) => !prev.some((p) => p.id === n.id))]))
        setHasMore(batch.length === 20)
        setError(null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err)
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [page, attempt])

  const changed = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore: () => {
      setLoading(true)
      setPage((p) => p + 1)
    },
    retry: () => {
      setLoading(true)
      setAttempt((n) => n + 1)
    },
    /** Marca como lida antes de seguir o link da notificação */
    markRead: async (notification: AppNotification) => {
      if (notification.read) return
      setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
      await markNotificationRead(notification.id).catch(() => undefined)
      changed()
    },
    markAllRead: async () => {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      await markAllNotificationsRead().catch(() => undefined)
      changed()
    },
  }
}
