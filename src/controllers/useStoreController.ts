import { useEffect, useMemo, useState } from 'react'
import type { ChatInboxItem } from '../models/chatInbox'
import type { Category } from '../models/boardgame'
import { listCategories } from '../models/services/boardgameService'
import { listInbox } from '../models/services/negotiationService'
import { listStoreOffers } from '../models/services/storeService'
import { readUserId } from '../models/session'
import type { StoreOffer } from '../models/store'
import { useDebouncedValue } from './useDebouncedValue'

/** Atalho de preço do filtro "Até R$ 100" */
export const BUDGET_LIMIT = 100

/** Abas da Loja: a vitrine pública e, para quem está logado, os seus anúncios e negociações */
export type StoreTab = 'vitrine' | 'anuncios' | 'negociacoes'

export type StoreSort = 'price-asc' | 'price-desc' | 'recent' | 'az'

export const STORE_SORTS: { value: StoreSort; label: string }[] = [
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'az', label: 'A–Z' },
]

type Section = { key: string; offers: StoreOffer[]; error: unknown }

function useSection(key: string | null, load: (signal: AbortSignal) => Promise<StoreOffer[]>) {
  const [state, setState] = useState<Section>({ key: '', offers: [], error: null })
  useEffect(() => {
    if (key === null) return
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
  const loading = key !== null && state.key !== key
  return { offers: loading ? [] : state.offers, loading, error: loading ? null : state.error }
}

function initialTab(signedIn: boolean): StoreTab {
  const tab = new URLSearchParams(window.location.search).get('aba')
  return signedIn && (tab === 'anuncios' || tab === 'negociacoes') ? tab : 'vitrine'
}

/** Ordena os anúncios da vitrine (a API só devolve por preço ou recentes) */
export function sortOffers(offers: StoreOffer[], sort: StoreSort) {
  const list = [...offers]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => Number(a.price) - Number(b.price))
    case 'price-desc':
      return list.sort((a, b) => Number(b.price) - Number(a.price))
    case 'recent':
      return list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    case 'az':
      return list.sort((a, b) => a.game.name.localeCompare(b.game.name, 'pt-BR'))
  }
}

/**
 * Loja (estilo Steam). Vitrine: destaques, recentes e "explorar" com busca, categorias (várias),
 * preço até R$ 100 e ordenação. Abas da conta: Meus anúncios e Minhas negociações.
 */
export function useStoreController() {
  const signedIn = Boolean(readUserId())
  const [tab, setTab] = useState<StoreTab>(() => initialTab(signedIn))
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 300)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [budgetOnly, setBudgetOnly] = useState(false)
  const [sort, setSort] = useState<StoreSort>('price-asc')
  const [categories, setCategories] = useState<Category[]>([])
  const [negotiations, setNegotiations] = useState<{ items: ChatInboxItem[] | null; error: unknown }>({
    items: null,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    listCategories(controller.signal)
      .then(setCategories)
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const recent = useSection(`recent\u0000${attempt}`, (signal) => listStoreOffers({ sort: 'recent', limit: 12 }, signal))
  // Explorar: a busca vai à API; categorias, faixa de preço e ordem são aplicadas aqui
  const explore = useSection(`explore\u0000${query}\u0000${attempt}`, (signal) =>
    listStoreOffers({ sort: 'price', q: query || undefined, limit: 100 }, signal),
  )
  const all = useSection(signedIn && tab === 'anuncios' ? `mine\u0000${attempt}` : null, (signal) =>
    listStoreOffers({ sort: 'recent', limit: 100 }, signal),
  )

  // Minhas negociações: vêm da caixa de conversas
  useEffect(() => {
    if (!signedIn || tab !== 'negociacoes') return
    const controller = new AbortController()
    listInbox(controller.signal)
      .then((items) => setNegotiations({ items: items.filter((i) => i.kind === 'NEGOTIATION'), error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setNegotiations({ items: [], error })
      })
    return () => controller.abort()
  }, [signedIn, tab, attempt])

  const exploreOffers = useMemo(() => {
    const filtered = explore.offers.filter(
      (o) =>
        (selectedCategories.length === 0 || (o.game.category !== null && selectedCategories.includes(o.game.category))) &&
        (!budgetOnly || Number(o.price) <= BUDGET_LIMIT),
    )
    return sortOffers(filtered, sort)
  }, [explore.offers, selectedCategories, budgetOnly, sort])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const offer of explore.offers) {
      if (offer.game.category) counts[offer.game.category] = (counts[offer.game.category] ?? 0) + 1
    }
    return counts
  }, [explore.offers])

  const hasFilters = Boolean(query || selectedCategories.length || budgetOnly)

  return {
    signedIn,
    tab,
    selectTab: (next: StoreTab) => {
      setTab(next)
      const url = new URL(window.location.href)
      if (next === 'vitrine') url.searchParams.delete('aba')
      else url.searchParams.set('aba', next)
      window.history.replaceState(null, '', url)
    },
    featured: recent.offers.slice(0, 5),
    recent,
    explore: { ...explore, offers: exploreOffers },
    mine: { ...all, offers: all.offers.filter((o) => o.isMine) },
    negotiations: {
      items: negotiations.items ?? [],
      loading: signedIn && tab === 'negociacoes' && negotiations.items === null && !negotiations.error,
      error: negotiations.error,
    },
    retry: () => {
      setNegotiations({ items: null, error: null })
      setAttempt((n) => n + 1)
    },
    search,
    setSearch,
    query,
    categoryNames: categories.map((c) => c.name),
    categoryCounts,
    selectedCategories,
    toggleCategory: (name: string) =>
      setSelectedCategories((current) =>
        current.includes(name) ? current.filter((c) => c !== name) : [...current, name],
      ),
    clearCategories: () => setSelectedCategories([]),
    budgetOnly,
    toggleBudget: () => setBudgetOnly((v) => !v),
    sort,
    setSort,
    hasFilters,
    clearFilters: () => {
      setSearch('')
      setSelectedCategories([])
      setBudgetOnly(false)
    },
  }
}
