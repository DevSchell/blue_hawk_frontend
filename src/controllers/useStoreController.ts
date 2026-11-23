import { useEffect, useMemo, useState } from 'react'
import type { Category } from '../models/boardgame'
import { listCategories } from '../models/services/boardgameService'
import { listStoreOffers } from '../models/services/storeService'
import type { StoreOffer } from '../models/store'
import { useDebouncedValue } from './useDebouncedValue'

/** Atalho de preço da seção "Preços mais baixos" */
export const BUDGET_LIMIT = 100

type Section = { key: string; offers: StoreOffer[]; error: unknown }

function useSection(key: string, load: (signal: AbortSignal) => Promise<StoreOffer[]>) {
  const [state, setState] = useState<Section>({ key: '', offers: [], error: null })
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((offers) => setState({ key, offers, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ key, offers: [], error })
      })
    return () => controller.abort()
    // load muda a cada render; a chave já descreve tudo o que a busca usa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const loading = state.key !== key
  return { offers: loading ? [] : state.offers, loading, error: loading ? null : state.error }
}

/** Loja (estilo Steam): destaques e recentes no topo, e a busca por preço com filtros */
export function useStoreController() {
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 300)
  const [category, setCategory] = useState<string | null>(null)
  const [budgetOnly, setBudgetOnly] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<StoreOffer | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listCategories(controller.signal)
      .then(setCategories)
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const recent = useSection(`recent\u0000${attempt}`, (signal) => listStoreOffers({ sort: 'recent', limit: 12 }, signal))
  const cheapest = useSection(`price\u0000${query}\u0000${category ?? ''}\u0000${attempt}`, (signal) =>
    listStoreOffers({ sort: 'price', q: query || undefined, category: category ?? undefined, limit: 48 }, signal),
  )

  const cheapestOffers = useMemo(
    () => (budgetOnly ? cheapest.offers.filter((o) => Number(o.price) <= BUDGET_LIMIT) : cheapest.offers),
    [cheapest.offers, budgetOnly],
  )

  return {
    featured: recent.offers.slice(0, 5),
    recent,
    cheapest: { ...cheapest, offers: cheapestOffers },
    retry: () => setAttempt((n) => n + 1),
    search,
    setSearch,
    query,
    categories,
    category,
    toggleCategory: (name: string) => setCategory((current) => (current === name ? null : name)),
    clearCategory: () => setCategory(null),
    budgetOnly,
    toggleBudget: () => setBudgetOnly((v) => !v),
    hasFilters: Boolean(query || category || budgetOnly),
    clearFilters: () => {
      setSearch('')
      setCategory(null)
      setBudgetOnly(false)
    },
    selected,
    openOffer: (offer: StoreOffer) => setSelected(offer),
    closeOffer: () => setSelected(null),
  }
}
