import { useCallback, useEffect, useState } from 'react'
import type { ChatInboxItem } from '../models/chatInbox'
import type { Negotiation, NegotiationMessage } from '../models/negotiation'
import {
  acceptProposal,
  getInboxUnreadCount,
  getNegotiation,
  listInbox,
  listNegotiationMessages,
  sendNegotiationMessage,
} from '../models/services/negotiationService'
import { usePolling } from './useMatchChat'
import { isSameChannel } from '../models/realtime'
import { NOTIFICATIONS_CHANGED } from './useNotifications'
import { useLiveInterval, useRealtimeEvent } from './useRealtime'

/** Polling de reserva da caixa e das conversas (o tempo real avisa na hora) */
const INBOX_POLL_MS = 15000
const UNREAD_POLL_MS = 30000
const MESSAGES_POLL_MS = 5000

/** Contador do botão de chat: busca ao abrir, a cada 30 s e quando algo é lido */
export function useInboxUnread(enabled: boolean) {
  const [count, setCount] = useState(0)
  const refresh = useCallback(() => {
    if (!enabled) return
    getInboxUnreadCount()
      .then((result) => setCount(result.count))
      .catch(() => undefined)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    refresh()
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, refresh)
  }, [enabled, refresh])
  usePolling(refresh, useLiveInterval(UNREAD_POLL_MS), enabled)

  return { count: enabled ? count : 0, refresh }
}

/** Lista da caixa de conversas, atualizada enquanto está aberta */
export function useInbox(enabled: boolean) {
  const [items, setItems] = useState<ChatInboxItem[] | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    listInbox(controller.signal)
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err)
      })
    return () => controller.abort()
  }, [enabled, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  usePolling(reload, useLiveInterval(INBOX_POLL_MS), enabled)
  // Qualquer mensagem nova reordena a caixa e muda a prévia
  useRealtimeEvent((event) => {
    if (event.type === 'chat.message') reload()
  }, enabled)
  useEffect(() => {
    if (!enabled) return
    window.addEventListener(NOTIFICATIONS_CHANGED, reload)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, reload)
  }, [enabled, reload])

  return { items, error, loading: enabled && items === null && !error, reload }
}

/** Uma negociação aberta: dados do anúncio, mensagens (só as novas a cada poucos segundos), envio e aceite */
export function useNegotiationThread(negotiationId: string) {
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null)
  const [messages, setMessages] = useState<NegotiationMessage[] | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [sending, setSending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getNegotiation(negotiationId, controller.signal),
      listNegotiationMessages(negotiationId, undefined, controller.signal),
    ])
      .then(([data, list]) => {
        setNegotiation(data)
        setMessages(list)
        // A API marca como lidas as notificações desta negociação
        window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err)
      })
    return () => controller.abort()
  }, [negotiationId])

  const lastAt = messages?.at(-1)?.createdAt
  const fetchNew = useCallback(() => {
    if (!messages) return
    listNegotiationMessages(negotiationId, lastAt)
      .then((fresh) => {
        if (fresh.length > 0) setMessages((prev) => merge(prev ?? [], fresh))
      })
      .catch(() => undefined)
    // O status pode mudar do outro lado (ex.: o vendedor aceitou)
    getNegotiation(negotiationId)
      .then(setNegotiation)
      .catch(() => undefined)
  }, [negotiationId, lastAt, messages])
  usePolling(fetchNew, useLiveInterval(MESSAGES_POLL_MS), true)
  useRealtimeEvent((event) => {
    if (event.type === 'chat.message' && isSameChannel(event.channel, { kind: 'NEGOTIATION', negotiationId })) fetchNew()
  })

  async function send(body: string, proposedPrice: number | null) {
    setSending(true)
    setActionError(null)
    try {
      const message = await sendNegotiationMessage(negotiationId, body, proposedPrice)
      setMessages((prev) => merge(prev ?? [], [message]))
      return true
    } catch {
      setActionError('Não deu para enviar. Tente de novo.')
      return false
    } finally {
      setSending(false)
    }
  }

  async function accept(messageId: string) {
    setSending(true)
    setActionError(null)
    try {
      setNegotiation(await acceptProposal(negotiationId, messageId))
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
    } catch {
      setActionError('Não deu para aceitar a proposta. Talvez o anúncio já tenha sido vendido.')
    } finally {
      setSending(false)
    }
  }

  return {
    negotiation,
    messages: messages ?? [],
    loading: !error && (negotiation === null || messages === null),
    error,
    sending,
    actionError,
    send,
    accept,
  }
}

function merge(current: NegotiationMessage[], fresh: NegotiationMessage[]) {
  const seen = new Set(current.map((m) => m.id))
  return [...current, ...fresh.filter((m) => !seen.has(m.id))]
}
