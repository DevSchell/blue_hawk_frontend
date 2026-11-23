import { useState } from 'react'
import { readUserId } from '../models/session'
import { listStoreOffers } from '../models/services/shelfService'
import { useAsyncList } from './useAsyncList'
import { useDebouncedValue } from './useDebouncedValue'

/** Loja: ofertas ativas de todos os usuários, com busca pelo nome do jogo */
export function useStoreController() {
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim().toLowerCase(), 250)
  const userId = readUserId()
  const list = useAsyncList((signal) => listStoreOffers(signal))

  const offers = (list.data ?? []).filter((o) => !query || o.game.name.toLowerCase().includes(query))

  return { search, setSearch, query, userId, offers, loading: list.loading, error: list.error, retry: list.reload }
}
