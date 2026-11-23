import { useEffect, useState } from 'react'
import type { Boardgame } from '../models/boardgame'
import { readIsAdmin, readUserId } from '../models/session'
import { ApiError, apiGet } from '../models/services/apiClient'
import { approveBoardgame, listBoardgamesForReview, rejectBoardgame } from '../models/services/boardgameService'

export type ReviewTab = 'PENDING' | 'REJECTED'

type FetchState = { key: string; games: Boardgame[]; error: unknown }

/** Nome de quem enviou (GET /users/{id}); em falha, a tela mostra só "um usuário" */
async function loadAuthorNames(games: Boardgame[], signal: AbortSignal) {
  const ids = [...new Set(games.map((g) => g.submittedBy).filter((id): id is string => Boolean(id)))]
  const names: Record<string, string> = {}
  await Promise.all(
    ids.map(async (id) => {
      try {
        const user = await apiGet<{ name: string }>(`/users/${encodeURIComponent(id)}`, {}, signal)
        names[id] = user.name
      } catch {
        // Autor removido ou erro pontual: segue sem o nome
      }
    }),
  )
  return names
}

/** Fila de aprovação do admin: jogos pendentes (ou recusados) com aprovar/recusar */
export function useReviewQueueController() {
  const signedIn = Boolean(readUserId())
  const isAdmin = readIsAdmin()
  const [tab, setTab] = useState<ReviewTab>('PENDING')
  const [attempt, setAttempt] = useState(0)
  const [fetchState, setFetchState] = useState<FetchState>({ key: '', games: [], error: null })
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({})
  /** Jogo com o campo de motivo aberto */
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: 'info' | 'warn'; text: string } | null>(null)

  const fetchKey = isAdmin ? `${tab}\u0000${attempt}` : ''
  const loading = isAdmin && fetchState.key !== fetchKey
  const error = loading ? null : fetchState.error

  useEffect(() => {
    if (!isAdmin) return
    const controller = new AbortController()
    listBoardgamesForReview(tab, controller.signal)
      .then(async (games) => {
        const names = await loadAuthorNames(games, controller.signal)
        if (controller.signal.aborted) return
        setAuthorNames((prev) => ({ ...prev, ...names }))
        setFetchState({ key: fetchKey, games, error: null })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setFetchState({ key: fetchKey, games: [], error: err })
      })
    return () => controller.abort()
  }, [isAdmin, tab, fetchKey])

  const removeFromList = (id: string) =>
    setFetchState((prev) => ({ ...prev, games: prev.games.filter((g) => g.id !== id) }))

  const failure = (err: unknown) =>
    setNotice({
      tone: 'warn',
      text:
        err instanceof ApiError && err.status === 403
          ? 'Sua conta não tem mais permissão de admin.'
          : 'Não foi possível salvar a decisão. Tente de novo.',
    })

  const approve = async (game: Boardgame) => {
    setBusyId(game.id)
    setNotice(null)
    try {
      await approveBoardgame(game.id)
      removeFromList(game.id)
      setNotice({ tone: 'info', text: `“${game.name}” aprovado: já aparece na Wiki.` })
    } catch (err) {
      failure(err)
    } finally {
      setBusyId(null)
    }
  }

  const confirmReject = async (game: Boardgame) => {
    setBusyId(game.id)
    setNotice(null)
    try {
      await rejectBoardgame(game.id, rejectReason.trim())
      removeFromList(game.id)
      setRejectingId(null)
      setRejectReason('')
      setNotice({ tone: 'info', text: `“${game.name}” recusado. Ele continua na estante de quem cadastrou.` })
    } catch (err) {
      failure(err)
    } finally {
      setBusyId(null)
    }
  }

  return {
    signedIn,
    isAdmin,
    tab,
    selectTab: (next: ReviewTab) => {
      setTab(next)
      setRejectingId(null)
      setNotice(null)
    },
    games: fetchState.key === fetchKey ? fetchState.games : [],
    loading,
    error,
    retry: () => setAttempt((n) => n + 1),
    authorName: (game: Boardgame) => (game.submittedBy && authorNames[game.submittedBy]) || 'um usuário',
    rejectingId,
    startReject: (game: Boardgame) => {
      setRejectingId(game.id)
      setRejectReason('')
    },
    cancelReject: () => setRejectingId(null),
    rejectReason,
    setRejectReason,
    busyId,
    notice,
    approve,
    confirmReject,
  }
}
