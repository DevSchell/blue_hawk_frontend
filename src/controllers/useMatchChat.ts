import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, ChatOverview, ChatTarget } from '../models/matchChat'
import { getChatOverview, listMessages, sendMessage } from '../models/services/matchChatService'
import { isSameChannel } from '../models/realtime'
import { NOTIFICATIONS_CHANGED } from './useNotifications'
import { useLiveInterval, useRealtimeEvent } from './useRealtime'

/** Polling de reserva do chat (o tempo real avisa na hora; ver useLiveInterval) */
const MESSAGES_POLL_MS = 5000
const OVERVIEW_POLL_MS = 15000

/** Repete {@code tick} a cada {@code ms}, só com a aba do navegador visível */
export function usePolling(tick: () => void, ms: number, enabled: boolean) {
  const saved = useRef(tick)
  useEffect(() => {
    saved.current = tick
  })
  useEffect(() => {
    if (!enabled) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') saved.current()
    }, ms)
    return () => window.clearInterval(timer)
  }, [ms, enabled])
}

/** Mesa, membros e conversas da partida, para quem está vendo */
export function useChatOverview(matchId: string, enabled: boolean) {
  const [overview, setOverview] = useState<ChatOverview | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    getChatOverview(matchId, controller.signal)
      .then((data) => {
        setOverview(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err)
      })
    return () => controller.abort()
  }, [matchId, enabled, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  usePolling(reload, useLiveInterval(OVERVIEW_POLL_MS), enabled)
  // Mensagem nova (contadores das conversas) ou mudança na partida (alguém entrou/saiu): busca de novo
  useRealtimeEvent((event) => {
    if (event.type === 'chat.message' && event.channel.kind === 'MATCH' && event.channel.matchId === matchId) reload()
    if (event.type === 'match.changed' && event.matchId === matchId) reload()
  }, enabled)

  // Abrir uma conversa marca as notificações dela como lidas: os contadores das abas atualizam
  useEffect(() => {
    if (!enabled) return
    window.addEventListener(NOTIFICATIONS_CHANGED, reload)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, reload)
  }, [enabled, reload])

  return { overview, error, loading: enabled && !overview && !error, reload }
}

type ThreadState = { key: string; messages: ChatMessage[]; error: unknown }

/** Mensagens de uma conversa (mesa = null), buscando só as novas a cada poucos segundos */
export function useChatThread(matchId: string, target: ChatTarget, enabled: boolean) {
  const key = `${matchId}\u0000${target ?? 'mesa'}`
  const [state, setState] = useState<ThreadState>({ key: '', messages: [], error: null })
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const current = state.key === key ? state : { key, messages: [], error: null }
  const lastAt = current.messages.at(-1)?.createdAt

  // Primeira carga de cada conversa
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    listMessages(matchId, target, undefined, controller.signal)
      .then((messages) => {
        setState({ key, messages, error: null })
        // A API marca como lidas as notificações desta conversa
        window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ key, messages: [], error })
      })
    return () => controller.abort()
  }, [matchId, target, key, enabled])

  const fetchNew = useCallback(() => {
    if (state.key !== key) return
    listMessages(matchId, target, lastAt)
      .then((fresh) => {
        if (fresh.length === 0) return
        setState((prev) => (prev.key === key ? { ...prev, messages: merge(prev.messages, fresh) } : prev))
      })
      .catch(() => undefined)
  }, [matchId, target, key, lastAt, state.key])

  usePolling(fetchNew, useLiveInterval(MESSAGES_POLL_MS), enabled)
  // Chegou mensagem nesta conversa: busca as novas (o que também as marca como lidas)
  useRealtimeEvent((event) => {
    if (event.type !== 'chat.message') return
    if (isSameChannel(event.channel, { kind: 'MATCH', matchId, withUserId: target })) fetchNew()
  }, enabled)

  async function send(body: string) {
    setSending(true)
    setSendError(null)
    try {
      const message = await sendMessage(matchId, target, body)
      setState((prev) => (prev.key === key ? { ...prev, messages: merge(prev.messages, [message]) } : prev))
      return true
    } catch {
      setSendError('Não deu para enviar. Tente de novo.')
      return false
    } finally {
      setSending(false)
    }
  }

  return {
    messages: current.messages,
    loading: enabled && state.key !== key,
    error: current.error,
    sending,
    sendError,
    send,
  }
}

/** Junta mensagens novas sem repetir (o envio e a atualização podem trazer a mesma) */
function merge(current: ChatMessage[], fresh: ChatMessage[]) {
  const seen = new Set(current.map((m) => m.id))
  return [...current, ...fresh.filter((m) => !seen.has(m.id))]
}
