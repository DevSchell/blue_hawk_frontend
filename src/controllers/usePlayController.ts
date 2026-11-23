import { useEffect, useState } from 'react'
import type { OpenMatch } from '../models/openMatch'
import { readUserId } from '../models/session'
import { cancelMatch, cancelMyRequest, listOpenMatches } from '../models/services/openMatchService'
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
  const [busyId, setBusyId] = useState<string | null>(null)
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
  const replace = (updated: OpenMatch) =>
    setState((prev) => ({ ...prev, matches: prev.matches.map((m) => (m.id === updated.id ? updated : m)) }))

  async function run(match: OpenMatch, action: () => Promise<OpenMatch>, success: string) {
    setBusyId(match.id)
    try {
      replace(await action())
      setToast(success)
    } catch {
      setToast('Não deu para concluir. Tente de novo.')
    } finally {
      setBusyId(null)
    }
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
    withdraw: (match: OpenMatch) =>
      run(match, () => cancelMyRequest(match.id), 'Você desistiu da partida.'),

    isHosting,
    openHost: () => setIsHosting(true),
    closeHost: () => setIsHosting(false),
    hosted: (created: OpenMatch) => {
      setIsHosting(false)
      setToast(`Partida de ${created.game?.name ?? 'jogo'} aberta em ${created.city}!`)
      reload()
    },
    cancel: (match: OpenMatch) => run(match, () => cancelMatch(match.id), 'Partida cancelada.'),

    managing,
    openRequests: (match: OpenMatch) => setManaging(match),
    /** Ao fechar a lista de pedidos, recarrega: vagas e contadores podem ter mudado */
    closeRequests: () => {
      setManaging(null)
      reload()
    },
  }
}
