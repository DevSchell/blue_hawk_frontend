import { useEffect, useState } from 'react'
import type { Offer, UserBoardgame } from '../models/market'
import type { OpenMatch } from '../models/openMatch'
import { createOffer, listActiveOffers, listCopies } from '../models/services/marketService'
import { listOpenMatches } from '../models/services/openMatchService'
import { readUserId } from '../models/session'

type Data = {
  offers: Offer[]
  copies: UserBoardgame[]
  /** Próximas partidas do Jogue com este jogo */
  matches: OpenMatch[]
}

type Result = { key: number; data: Data | null; error: unknown }

/**
 * Ofertas e próximas partidas de um jogo, para a modal de detalhes. Tudo isso exige login na API;
 * sem sessão, nada é buscado.
 */
export function useGameMarket(boardgameId: string) {
  const userId = readUserId()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result>({ key: -1, data: null, error: null })

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()

    Promise.all([
      listActiveOffers(boardgameId, controller.signal),
      listCopies(boardgameId, controller.signal),
      listOpenMatches({ boardgameId }, controller.signal),
    ])
      .then(([offers, copies, matches]) => setResult({ key: attempt, data: { offers, copies, matches }, error: null }))
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

  const reload = () => setAttempt((n) => n + 1)

  const myCopy = data?.copies.find((c) => c.userId === userId) ?? null

  /** Anuncia a cópia do usuário. Só quem tem o jogo na estante pode vender. */
  async function publishOffer(price: number, description: string) {
    if (!userId || !myCopy) throw new Error('Adicione o jogo à sua estante antes de anunciar.')
    await createOffer(myCopy.id, price, description)
    reload()
  }

  return {
    signedIn: Boolean(userId),
    /** O jogo está na estante do usuário (ele pode anunciar venda) */
    ownsGame: Boolean(myCopy),
    /** O usuário já tem um anúncio ativo deste jogo */
    hasMyOffer: offers.some((offer) => offer.isMine),
    reload,
    loading,
    error: loading ? null : result.error,
    offers,
    matches: data?.matches ?? [],
    retry: reload,
    publishOffer,
  }
}
