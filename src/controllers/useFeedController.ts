import { useState } from 'react'
import type { Boardgame } from '../models/boardgame'
import { useBoardgameFeed } from './useBoardgameFeed'
import { useDebouncedValue } from './useDebouncedValue'

/**
 * Estado da página do feed: busca digitada, busca efetiva (com espera), a lista paginada
 * e o jogo aberto na modal de detalhes.
 */
export function useFeedController() {
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 350)
  const feed = useBoardgameFeed(query)
  const [selectedGame, setSelectedGame] = useState<Boardgame | null>(null)

  return {
    search,
    setSearch,
    query,
    feed,
    isEmpty: !feed.loadingFirstPage && !feed.error && feed.items.length === 0,
    selectedGame,
    openGame: (game: Boardgame) => setSelectedGame(game),
    closeGame: () => setSelectedGame(null),
  }
}
