import { useEffect, useState } from 'react'
import type { OpenMatch } from '../models/openMatch'
import { readUserId } from '../models/session'
import { cancelMyRequest, getOpenMatch } from '../models/services/openMatchService'
import { useRealtimeEvent } from './useRealtime'

type LoadState = { key: number; match: OpenMatch | null; error: unknown }

/**
 * Página da partida: carrega a mesa pelo id e cuida das ações (pedir vaga, desistir, ver pedidos, cancelar).
 * {@code ?chat=} (mesa ou o id da pessoa) abre a conversa certa quando vem de uma notificação.
 */
export function useMatchPage(matchId: string) {
  const signedIn = Boolean(readUserId())
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<LoadState>({ key: -1, match: null, error: null })
  const [initialChat] = useState(() => new URLSearchParams(window.location.search).get('chat'))
  const [joining, setJoining] = useState(false)
  const [managing, setManaging] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  // Cancelar e desistir rodam nas modais de confirmação (que mostram o próprio "carregando")
  const busy = false
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getOpenMatch(matchId, controller.signal)
      .then((match) => setState({ key: attempt, match, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ key: attempt, match: null, error })
      })
    return () => controller.abort()
  }, [matchId, attempt])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const reload = () => setAttempt((n) => n + 1)
  useRealtimeEvent((event) => {
    if (event.type === 'match.changed' && event.matchId === matchId) reload()
  })
  const replace = (match: OpenMatch) => setState((prev) => ({ ...prev, match }))
  // Recarregar a mesma partida (após uma ação) não volta para o "carregando"
  const loading = state.key === -1 || (state.key !== attempt && !state.match)

  return {
    signedIn,
    loading,
    error: loading ? null : state.error,
    match: state.match,
    retry: reload,
    initialChat,
    busy,
    toast,

    joining,
    openJoin: () => setJoining(true),
    closeJoin: () => setJoining(false),
    joined: (updated: OpenMatch) => {
      replace(updated)
      setJoining(false)
      setToast(`Pedido enviado para ${updated.host.name}. A conversa com o host já está aberta.`)
    },
    /** Desistir pede confirmação; a modal chama confirmWithdraw */
    withdrawing,
    withdraw: () => setWithdrawing(true),
    closeWithdraw: () => setWithdrawing(false),
    confirmWithdraw: async () => {
      replace(await cancelMyRequest(matchId))
      setWithdrawing(false)
      setToast('Você desistiu da partida.')
    },
    /** Abre a confirmação (com o motivo); o cancelamento é feito pela modal */
    cancelling,
    cancel: () => setCancelling(true),
    closeCancel: () => setCancelling(false),
    cancelled: (updated: OpenMatch) => {
      replace(updated)
      setCancelling(false)
      setToast('Partida cancelada. Os jogadores foram avisados.')
    },

    managing,
    openRequests: () => setManaging(true),
    /** Ao fechar os pedidos, recarrega: vagas, membros e conversas podem ter mudado */
    closeRequests: () => {
      setManaging(false)
      reload()
    },
  }
}
