import { useEffect, useRef, useSyncExternalStore } from 'react'
import {
  isRealtimeConnected,
  onRealtime,
  startRealtime,
  stopRealtime,
  subscribeRealtimeStatus,
  type RealtimeEvent,
} from '../models/realtime'
import { NOTIFICATIONS_CHANGED } from './useNotifications'

/** Liga o tempo real enquanto há sessão; "notificações mudaram" vira o mesmo aviso que o app já usa */
export function useRealtimeSession(sessionKey: string | null) {
  useEffect(() => {
    if (!sessionKey) return
    startRealtime()
    const off = onRealtime((event) => {
      if (event.type === 'notifications.changed') window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
    })
    return () => {
      off()
      stopRealtime()
    }
  }, [sessionKey])
}

/** Escuta os eventos do tempo real (o handler mais recente, sem re-assinar a cada render) */
export function useRealtimeEvent(handler: (event: RealtimeEvent) => void, enabled = true) {
  const saved = useRef(handler)
  useEffect(() => {
    saved.current = handler
  })
  useEffect(() => {
    if (!enabled) return
    return onRealtime((event) => saved.current(event))
  }, [enabled])
}

export function useRealtimeConnected() {
  return useSyncExternalStore(subscribeRealtimeStatus, isRealtimeConnected, () => false)
}

/**
 * Intervalo do polling de reserva: com o socket de pé, as mudanças chegam na hora e o polling
 * só cobre algum evento perdido (bem mais espaçado).
 */
export function useLiveInterval(ms: number) {
  const connected = useRealtimeConnected()
  return connected ? Math.max(ms * 6, 60_000) : ms
}
