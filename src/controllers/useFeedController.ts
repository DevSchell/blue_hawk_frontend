import { useState } from 'react'
import { useBoardgameFeed } from './useBoardgameFeed'
import { useDebouncedValue } from './useDebouncedValue'

/** Estado da página do feed: busca digitada, busca efetiva (com espera) e a lista paginada. */
export function useFeedController() {
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 350)
  const feed = useBoardgameFeed(query)

  return {
    search,
    setSearch,
    query,
    feed,
    isEmpty: !feed.loadingFirstPage && !feed.error && feed.items.length === 0,
  }
}
