import { useEffect, useState } from 'react'
import type { OpenMatch } from '../models/openMatch'
import { readUserId } from '../models/session'
import { cancelMyRequest, listOpenMatches } from '../models/services/openMatchService'
import { matchPath } from '../views/layout/navigation'
import { navigate } from '../views/layout/router'
import { useDebouncedValue } from './useDebouncedValue'

export type PlayTab = 'abertas' | 'minhas'

type FetchState = { key: string; matches: OpenMatch[]; error: unknown }

function initialTab(): PlayTab {
  return new URLSearchParams(window.location.search).get('aba') === 'minhas' ? 'minhas' : 'abertas'
}

/**
 * Página "Jogue" (matchmaking): partidas abertas (filtro por cidade) e as do usuário,
 * mais as modais de pedir entrada, hospedar e ver pedidos (host).
 */
export function usePlayController() {
  const signedIn = Boolean(readUserId())
  const [tab, setTab] = useState<PlayTab>(() => (signedIn ? initialTab() : 'abertas'))
  // ?cidade= vem do link "Ver no Jogue" da Wiki
  const [city, setCity] = useState(() => new URLSearchParams(window.location.search).get('cidade') ?? '')
  const cityQuery = useDebouncedValue(city.trim(), 350)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<FetchState>({ key: '', matches: [], error: null })

  const [joining, setJoining] = useState<OpenMatch | null>(null)
  const [managing, setManaging] = useState<OpenMatch | null>(null)
  const [isHosting, setIsHosting] = useState(false)
  const [cancelling, setCancelling] = useState<OpenMatch | null>(null)
  const [withdrawing, setWithdrawing] = useState<OpenMatch | null>(null)
  // As ações de cancelar e desistir rodam nas modais de confirmação (que mostram o próprio "carregando")
  const busyId: string | null = null
  const [toast, setToast] = useState<string | null>(null)

  const fetchKey = `${tab}\u0000${tab === 'minhas' ? '' : cityQuery}\u0000${attempt}`
  const loading = state.key !== fetchKey

  useEffect(() => {
    const controller = new AbortController()
    listOpenMatches(tab === 'minhas' ? { mine: true } : { city: cityQuery || undefined }, controller.signal)
      .then((matches) => setState({ key: fetchKey, matches, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ key: fetchKey, matches: [], error })
      })
    return () => controller.abort()
  }, [tab, cityQuery, fetchKey])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const reload = () => setAttempt((n) => n + 1)

  /** Troca uma partida da lista pela versão que a API devolveu */
  const replace = (updated: OpenMatch) => {
    setState((prev) => ({ ...prev, matches: prev.matches.map((m) => (m.id === updated.id ? updated : m)) }))
  }

  return {
    signedIn,
    tab,
    selectTab: (next: PlayTab) => {
      setTab(next)
      const url = new URL(window.location.href)
      if (next === 'minhas') url.searchParams.set('aba', 'minhas')
      else url.searchParams.delete('aba')
      window.history.replaceState(null, '', url)
    },
    city,
    setCity,
    cityQuery,
    matches: loading ? [] : state.matches,
    loading,
    error: loading ? null : state.error,
    retry: reload,
    busyId,
    toast,

    joining,
    openJoin: (match: OpenMatch) => setJoining(match),
    closeJoin: () => setJoining(null),
    /** Pedido enviado pela modal: atualiza o card */
    joined: (updated: OpenMatch) => {
      replace(updated)
      setJoining(null)
      setToast(`Pedido enviado para ${updated.host.name}. Você recebe a resposta aqui.`)
    },
    /** Desistir pede confirmação; a modal chama confirmWithdraw */
    withdrawing,
    withdraw: (match: OpenMatch) => setWithdrawing(match),
    closeWithdraw: () => setWithdrawing(null),
    confirmWithdraw: async () => {
      if (!withdrawing) return
      replace(await cancelMyRequest(withdrawing.id))
      setWithdrawing(null)
      setToast('Você desistiu da partida.')
    },

    isHosting,
    openHost: () => setIsHosting(true),
    closeHost: () => setIsHosting(false),
    hosted: (created: OpenMatch) => {
      setIsHosting(false)
      setToast(`Partida de ${created.game?.name ?? 'jogo'} aberta em ${created.city}!`)
      reload()
    },
    /** Abre a confirmação (com o motivo); o cancelamento é feito pela modal */
    cancelling,
    cancel: (match: OpenMatch) => setCancelling(match),
    closeCancel: () => setCancelling(null),
    cancelled: (updated: OpenMatch) => {
      replace(updated)
      setCancelling(null)
      setToast('Partida cancelada. Os jogadores foram avisados.')
    },

    /** Abre a página da partida (ficha e chats) */
    openMatch: (match: OpenMatch) => navigate(matchPath(match.id)),

    managing,
    openRequests: (match: OpenMatch) => setManaging(match),
    /** Ao fechar a lista de pedidos, recarrega: vagas e contadores podem ter mudado */
    closeRequests: () => {
      setManaging(null)
      reload()
    },
  }
}
