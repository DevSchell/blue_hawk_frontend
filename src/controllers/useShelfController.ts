import { useState } from 'react'
import { readUserId } from '../models/session'
import { addCopy, createOffer } from '../models/services/marketService'
import { purgeCopy } from '../models/services/accountService'
import { deleteOffer, listShelf, updateOffer } from '../models/services/shelfService'
import { useAsyncList } from './useAsyncList'
import { useDebouncedValue } from './useDebouncedValue'

/** Estante do usuário: jogos que tem, colocar à venda, editar preço, tirar da venda e remover */
export function useShelfController() {
  const userId = readUserId()
  const list = useAsyncList((signal) => (userId ? listShelf(userId, signal) : Promise.resolve([])))
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim().toLowerCase(), 250)
  const [actionError, setActionError] = useState<string | null>(null)

  const all = list.data ?? []
  const items = all.filter((i) => !query || i.game.name.toLowerCase().includes(query))

  async function run(action: () => Promise<unknown>, failure: string) {
    setActionError(null)
    try {
      await action()
      list.reload()
    } catch {
      setActionError(failure)
      throw new Error(failure)
    }
  }

  return {
    signedIn: Boolean(userId),
    loading: list.loading,
    error: list.error,
    retry: list.reload,
    search,
    setSearch,
    query,
    items,
    ownedGameIds: all.map((i) => i.game.id),
    actionError,
    addGame: (boardgameId: string) => run(() => addCopy(userId!, boardgameId), 'Não deu para adicionar o jogo.'),
    removeGame: (copyId: string) => run(() => purgeCopy(userId!, copyId), 'Não deu para remover o jogo.'),
    sell: (copyId: string, price: number, description: string) =>
      run(() => createOffer(copyId, price, description), 'Não deu para colocar à venda.'),
    editOffer: (offerId: string, price: number, description: string) =>
      run(() => updateOffer(offerId, price, description), 'Não deu para atualizar a oferta.'),
    withdrawOffer: (offerId: string) => run(() => deleteOffer(offerId), 'Não deu para tirar da venda.'),
  }
}
