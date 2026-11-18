import { useEffect, useState } from 'react'
import type { MatchWithPlayers, Offer, UserBoardgame } from '../models/market'
import {
  addCopy,
  createOffer,
  joinMatch,
  listActiveOffers,
  listCopies,
  listMatches,
} from '../models/services/marketService'
import { readUserId } from '../models/session'

type Data = {
  offers: Offer[]
  matches: MatchWithPlayers[]
  copies: UserBoardgame[]
}

type Result = { key: number; data: Data | null; error: unknown }

/**
 * Ofertas e partidas de um jogo, para a modal de detalhes. Tudo isso exige login na API;
 * sem sessão, nada é buscado.
 */
export function useGameMarket(boardgameId: string) {
  const userId = readUserId()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result>({ key: -1, data: null, error: null })
  // Partida em que o pedido para entrar está indo, e as que deram erro
  const [joining, setJoining] = useState<string | null>(null)
  const [joinErrors, setJoinErrors] = useState<string[]>([])

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()

    Promise.all([listActiveOffers(boardgameId, controller.signal), listCopies(boardgameId, controller.signal)])
      .then(async ([offers, copies]) => {
        const matches = await listMatches(copies, controller.signal)
        setResult({ key: attempt, data: { offers, copies, matches }, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setResult({ key: attempt, data: null, error })
      })

    return () => controller.abort()
  }, [boardgameId, userId, attempt])

  const loading = Boolean(userId) && result.key !== attempt
  const data = loading ? null : result.data
  const ownerOf = (copyId: string) => data?.copies.find((c) => c.id === copyId)?.userId

  const offers = (data?.offers ?? []).map((offer) => ({ ...offer, isMine: ownerOf(offer.userBoardgameId) === userId }))

  const matches = (data?.matches ?? [])
    .map((match) => ({
      ...match,
      isHost: ownerOf(match.userBoardgameId) === userId,
      isIn: userId ? match.participantIds.includes(userId) : false,
      isFull: match.maxUsers != null && match.participantIds.length >= match.maxUsers,
    }))
    // "Abertas": ainda cabe gente, ou o usuário já está nela
    .filter((match) => !match.isFull || match.isIn)

  const reload = () => setAttempt((n) => n + 1)

  async function requestToJoin(matchId: string) {
    if (!userId) return
    setJoining(matchId)
    setJoinErrors((list) => list.filter((id) => id !== matchId))
    try {
      await joinMatch(matchId, userId)
      reload()
    } catch {
      setJoinErrors((list) => [...list, matchId])
    } finally {
      setJoining(null)
    }
  }

  /** Cria a oferta a partir da cópia do usuário; se o jogo não está na estante dele, põe antes */
  async function publishOffer(price: number, description: string) {
    if (!userId) return
    const copy =
      data?.copies.find((c) => c.userId === userId) ?? (await addCopy(userId, boardgameId))
    await createOffer(copy.id, price, description)
    reload()
  }

  return {
    signedIn: Boolean(userId),
    loading,
    error: loading ? null : result.error,
    offers,
    matches,
    joining,
    joinErrors,
    retry: reload,
    requestToJoin,
    publishOffer,
  }
}
