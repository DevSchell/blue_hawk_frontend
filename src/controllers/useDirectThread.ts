import { useCallback, useEffect, useState } from 'react'
import type { DirectConversation } from '../models/directConversation'
import type { ChatMessage } from '../models/matchChat'
import { isSameChannel } from '../models/realtime'
import { getDirectConversation, listDirectMessages, sendDirectMessage } from '../models/services/directService'
import { usePolling } from './useMatchChat'
import { NOTIFICATIONS_CHANGED } from './useNotifications'
import { useLiveInterval, useRealtimeEvent } from './useRealtime'

const MESSAGES_POLL_MS = 5000

type State = { id: string; conversation: DirectConversation | null; messages: ChatMessage[]; error: unknown }

/** Uma conversa direta: dados (se dá para mandar), mensagens novas na hora (tempo real) e envio */
export function useDirectThread(conversationId: string, enabled: boolean) {
  const [state, setState] = useState<State>({ id: '', conversation: null, messages: [], error: null })
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const current =
    state.id === conversationId ? state : { id: conversationId, conversation: null, messages: [], error: null }
  const lastAt = current.messages.at(-1)?.createdAt

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    Promise.all([
      getDirectConversation(conversationId, controller.signal),
      listDirectMessages(conversationId, undefined, controller.signal),
    ])
      .then(([conversation, messages]) => {
        setState({ id: conversationId, conversation, messages, error: null })
        // A API marca como lidas as notificações desta conversa
        window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ id: conversationId, conversation: null, messages: [], error })
      })
    return () => controller.abort()
  }, [conversationId, enabled])

  const fetchNew = useCallback(() => {
    if (state.id !== conversationId) return
    listDirectMessages(conversationId, lastAt)
      .then((fresh) => {
        if (fresh.length === 0) return
        setState((prev) => (prev.id === conversationId ? { ...prev, messages: merge(prev.messages, fresh) } : prev))
      })
      .catch(() => undefined)
  }, [conversationId, lastAt, state.id])

  usePolling(fetchNew, useLiveInterval(MESSAGES_POLL_MS), enabled)
  useRealtimeEvent((event) => {
    if (event.type === 'chat.message' && isSameChannel(event.channel, { kind: 'DIRECT', conversationId })) fetchNew()
  }, enabled)

  async function send(body: string) {
    setSending(true)
    setSendError(null)
    try {
      const message = await sendDirectMessage(conversationId, body)
      setState((prev) => (prev.id === conversationId ? { ...prev, messages: merge(prev.messages, [message]) } : prev))
      return true
    } catch {
      setSendError('Não deu para enviar. Tente de novo.')
      return false
    } finally {
      setSending(false)
    }
  }

  return {
    conversation: current.conversation,
    messages: current.messages,
    loading: enabled && state.id !== conversationId,
    error: current.error,
    sending,
    sendError,
    send,
  }
}

function merge(current: ChatMessage[], fresh: ChatMessage[]) {
  const seen = new Set(current.map((m) => m.id))
  return [...current, ...fresh.filter((m) => !seen.has(m.id))]
}
