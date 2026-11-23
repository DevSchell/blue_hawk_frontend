import { useEffect, useState } from 'react'
import type { Boardgame } from '../models/boardgame'
import { readUserId } from '../models/session'
import { listBoardgames } from '../models/services/boardgameService'
import { addToShelf } from '../models/services/shelfService'
import { useDebouncedValue } from './useDebouncedValue'

const RESULTS_SIZE = 20

type SearchState = { key: string; results: Boardgame[]; error: boolean }

/**
 * Busca de jogos da Wiki (só aprovados) para colocar na estante.
 * {@code ownedIds}: jogos que já estão na estante, mostrados como "Na estante".
 */
export function useAddGameController(ownedIds: Set<string>, onAdded: (game: Boardgame) => void) {
  const userId = readUserId()
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 300)
  const [state, setState] = useState<SearchState>({ key: '\u0000', results: [], error: false })
  const [addingId, setAddingId] = useState<string | null>(null)
  /** Adicionados nesta abertura da modal (a estante ainda está recarregando) */
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [failedId, setFailedId] = useState<string | null>(null)

  const loading = state.key !== query

  useEffect(() => {
    const controller = new AbortController()
    listBoardgames({ name: query || undefined, page: 0, size: RESULTS_SIZE }, controller.signal)
      .then((results) => setState({ key: query, results, error: false }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ key: query, results: [], error: true })
      })
    return () => controller.abort()
  }, [query])

  const add = async (game: Boardgame) => {
    if (!userId || addingId) return
    setAddingId(game.id)
    setFailedId(null)
    try {
      await addToShelf(userId, game.id)
      setAddedIds((prev) => new Set(prev).add(game.id))
      onAdded(game)
    } catch {
      setFailedId(game.id)
    } finally {
      setAddingId(null)
    }
  }

  return {
    search,
    setSearch,
    query,
    results: loading ? [] : state.results,
    loading,
    error: !loading && state.error,
    isEmpty: !loading && !state.error && state.results.length === 0,
    isOwned: (game: Boardgame) => ownedIds.has(game.id) || addedIds.has(game.id),
    addingId,
    failedId,
    add,
  }
}
