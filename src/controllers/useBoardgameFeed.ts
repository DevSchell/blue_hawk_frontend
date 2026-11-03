import { useEffect, useState } from 'react'
import type { Boardgame } from '../models/boardgame'
import { listBoardgames } from '../models/services/boardgameService'

export const FEED_PAGE_SIZE = 12

type Result = {
  /** Requisição que produziu este resultado; enquanto difere da atual, está carregando */
  key: string
  items: Boardgame[]
  hasMore: boolean
  error: unknown
}

/**
 * Feed paginado de GET /boardgames. A API não devolve total, então
 * "tem mais" é inferido de uma página cheia.
 */
export function useBoardgameFeed(query: string) {
  // A página pertence à busca: trocar a busca volta para a página 0
  const [cursor, setCursor] = useState({ query, page: 0 })
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result>({ key: '', items: [], hasMore: false, error: null })

  const page = cursor.query === query ? cursor.page : 0
  const key = `${query}\u0000${page}\u0000${attempt}`

  useEffect(() => {
    const controller = new AbortController()

    listBoardgames({ name: query.trim(), page, size: FEED_PAGE_SIZE }, controller.signal)
      .then((items) => {
        setResult((prev) => ({
          key,
          items: page === 0 ? items : [...prev.items, ...items],
          hasMore: items.length === FEED_PAGE_SIZE,
          error: null,
        }))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        // Numa página seguinte, mantém o que já foi carregado
        setResult((prev) => ({ ...prev, key, items: page === 0 ? [] : prev.items, error }))
      })

    return () => controller.abort()
  }, [key, query, page])

  const loading = result.key !== key

  return {
    items: result.items,
    hasMore: result.hasMore,
    error: loading ? null : result.error,
    /** Primeira página da busca atual ainda não chegou */
    loadingFirstPage: loading && page === 0,
    loadingMore: loading && page > 0,
    loadMore: () => setCursor({ query, page: page + 1 }),
    retry: () => setAttempt((n) => n + 1),
  }
}

export type BoardgameFeedState = ReturnType<typeof useBoardgameFeed>
