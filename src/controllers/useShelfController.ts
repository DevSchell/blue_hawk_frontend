import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { readUserId } from '../models/session'
import { getBoardgameById } from '../models/services/boardgameService'
import {
  createShelfOffer,
  deleteShelfOffer,
  listMatchesByUserBoardgame,
  listUserBoardgames,
  listUserOffers,
  registerMatch,
  removeFromShelf,
} from '../models/services/shelfService'
import {
  DEFAULT_SALE_PRICE,
  resolveGameCategory,
  SHELF_CATEGORIES,
  type PlayersFilterOption,
  type ShelfGame,
  type ShelfSortOption,
} from '../models/shelf'

export type ToastMessage = {
  id: number
  text: string
}

function estimateHours(plays: number, playTimeMinutes: number | null) {
  if (plays <= 0) return 0
  const minutesPerMatch = playTimeMinutes && playTimeMinutes > 0 ? playTimeMinutes : 60
  return Math.max(1, Math.round((plays * minutesPerMatch) / 60))
}

function matchesPlayersFilter(playerNumber: number | null, filter: PlayersFilterOption) {
  if (filter === 'any') return true
  if (!playerNumber) return false
  switch (filter) {
    case '1':
      return playerNumber === 1
    case '2':
      return playerNumber === 2
    case '3-4':
      return playerNumber >= 3 && playerNumber <= 4
    case '5+':
      return playerNumber >= 5
  }
}

type FetchState = {
  key: string
  games: ShelfGame[]
  error: unknown
}

export function useShelfController() {
  const userId = readUserId()
  const [attempt, setAttempt] = useState(0)
  const [fetchState, setFetchState] = useState<FetchState>({ key: '', games: [], error: null })

  const fetchKey = userId ? `${userId}\u0000${attempt}` : ''
  const loading = Boolean(userId) && fetchState.key !== fetchKey
  const error = loading ? null : fetchState.error

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
  const [onlyForSale, setOnlyForSale] = useState(false)
  const [playersFilter, setPlayersFilter] = useState<PlayersFilterOption>('any')
  const [sortBy, setSortBy] = useState<ShelfSortOption>('most-played')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [registeringMatch, setRegisteringMatch] = useState(false)
  const [togglingSale, setTogglingSale] = useState(false)
  const [removingGame, setRemovingGame] = useState(false)

  const [isRollingD20, setIsRollingD20] = useState(false)
  const [litGameId, setLitGameId] = useState<string | null>(null)
  const [altLitGameId, setAltLitGameId] = useState<string | null>(null)
  const [winnerGameId, setWinnerGameId] = useState<string | null>(null)

  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const showToast = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, text }])
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 3000)
    timersRef.current.push(timer)
  }, [])

  useEffect(() => {
    if (!userId) return

    const controller = new AbortController()

    listUserBoardgames(userId, controller.signal)
      .then(async (entries) => {
        const offers = await listUserOffers(userId, controller.signal).catch(() => [])
        const activeOffersByCopy = new Map(
          offers.filter((o) => o.status === 'ACTIVE').map((o) => [o.userBoardgameId, o]),
        )

        const seenBoardgames = new Set<string>()
        const resolved: ShelfGame[] = []

        for (const entry of entries) {
          if (controller.signal.aborted) return
          if (seenBoardgames.has(entry.boardgameId)) continue
          try {
            const boardgame = await getBoardgameById(entry.boardgameId, controller.signal)
            const matches = await listMatchesByUserBoardgame(entry.id, controller.signal).catch(() => [])
            const plays = matches.length
            const activeOffer = activeOffersByCopy.get(entry.id)
            seenBoardgames.add(entry.boardgameId)
            resolved.push({
              userBoardgameId: entry.id,
              boardgame,
              category: resolveGameCategory(boardgame),
              plays,
              hours: estimateHours(plays, boardgame.playTime),
              forSale: Boolean(activeOffer),
              salePrice: activeOffer ? Math.round(Number(activeOffer.price)) : DEFAULT_SALE_PRICE,
              offerId: activeOffer?.id ?? null,
            })
          } catch (itemErr) {
            if (controller.signal.aborted) return
            if (entries.length === 1) throw itemErr
          }
        }
        if (!controller.signal.aborted) {
          setFetchState({ key: fetchKey, games: resolved, error: null })
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setFetchState((prev) => ({ ...prev, key: fetchKey, error: err }))
      })

    return () => controller.abort()
  }, [userId, fetchKey])

  const games: ShelfGame[] = useMemo(() => {
    return userId ? fetchState.games : []
  }, [userId, fetchState.games])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todas: games.length }
    for (const cat of SHELF_CATEGORIES) {
      if (cat !== 'Todas') counts[cat] = 0
    }
    for (const g of games) {
      counts[g.category] = (counts[g.category] ?? 0) + 1
    }
    return counts
  }, [games])

  const summary = useMemo(() => {
    const totalGames = games.length
    const totalPlays = games.reduce((acc, g) => acc + g.plays, 0)
    const totalHours = games.reduce((acc, g) => acc + g.hours, 0)

    const playsByCategory: Record<string, number> = {}
    for (const g of games) {
      playsByCategory[g.category] = (playsByCategory[g.category] ?? 0) + Math.max(1, g.plays)
    }
    let topCategory = '—'
    let topCategoryScore = 0
    for (const [cat, score] of Object.entries(playsByCategory)) {
      if (score > topCategoryScore) {
        topCategoryScore = score
        topCategory = cat
      }
    }

    const forSaleGames = games.filter((g) => g.forSale)
    const forSaleCount = forSaleGames.length
    const forSaleTotalValue = forSaleGames.reduce((acc, g) => acc + g.salePrice, 0)

    return {
      totalGames,
      totalPlays,
      totalHours,
      topCategory,
      forSaleCount,
      forSaleTotalValue,
    }
  }, [games])

  const podiumGames = useMemo(() => {
    return [...games].sort((a, b) => b.plays - a.plays || b.hours - a.hours).slice(0, 3)
  }, [games])

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = games.filter((item) => {
      const matchesName =
        !query ||
        item.boardgame.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.boardgame.publisher?.toLowerCase().includes(query) ?? false)
      const matchesCat = selectedCategory === 'Todas' || item.category === selectedCategory
      const matchesSale = !onlyForSale || item.forSale
      const matchesPlayers = matchesPlayersFilter(item.boardgame.playerNumber, playersFilter)
      return matchesName && matchesCat && matchesSale && matchesPlayers
    })

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'most-played':
          return b.plays - a.plays || b.hours - a.hours || a.boardgame.name.localeCompare(b.boardgame.name, 'pt-BR')
        case 'most-hours':
          return b.hours - a.hours || b.plays - a.plays || a.boardgame.name.localeCompare(b.boardgame.name, 'pt-BR')
        case 'az':
          return a.boardgame.name.localeCompare(b.boardgame.name, 'pt-BR')
        case 'za':
          return b.boardgame.name.localeCompare(a.boardgame.name, 'pt-BR')
        case 'duration-asc':
          return (a.boardgame.playTime ?? Number.MAX_SAFE_INTEGER) - (b.boardgame.playTime ?? Number.MAX_SAFE_INTEGER)
      }
    })
  }, [games, searchQuery, selectedCategory, onlyForSale, playersFilter, sortBy])

  const selectedGame = useMemo(
    () => games.find((g) => g.userBoardgameId === selectedId) ?? null,
    [games, selectedId],
  )

  const clearRouletteWinner = useCallback(() => {
    setWinnerGameId(null)
    setLitGameId(null)
    setAltLitGameId(null)
  }, [])

  const updateSearchQuery = useCallback(
    (value: string) => {
      if (isRollingD20) return
      clearRouletteWinner()
      setSearchQuery(value)
    },
    [isRollingD20, clearRouletteWinner],
  )

  const selectCategory = useCallback(
    (category: string) => {
      if (isRollingD20) return
      clearRouletteWinner()
      setSelectedCategory(category)
    },
    [isRollingD20, clearRouletteWinner],
  )

  const toggleForSale = useCallback(() => {
    if (isRollingD20) return
    clearRouletteWinner()
    setOnlyForSale((prev) => !prev)
  }, [isRollingD20, clearRouletteWinner])

  const updatePlayersFilter = useCallback(
    (value: PlayersFilterOption) => {
      if (isRollingD20) return
      clearRouletteWinner()
      setPlayersFilter(value)
    },
    [isRollingD20, clearRouletteWinner],
  )

  const updateSortBy = useCallback(
    (value: ShelfSortOption) => {
      if (isRollingD20) return
      clearRouletteWinner()
      setSortBy(value)
    },
    [isRollingD20, clearRouletteWinner],
  )

  const resetFilters = useCallback(() => {
    if (isRollingD20) return
    clearRouletteWinner()
    setSearchQuery('')
    setSelectedCategory('Todas')
    setOnlyForSale(false)
    setPlayersFilter('any')
    setSortBy('most-played')
  }, [isRollingD20, clearRouletteWinner])

  const startD20Roulette = useCallback(() => {
    if (isRollingD20) return
    if (filteredGames.length === 0) {
      showToast('Nenhum jogo disponível nos filtros atuais para sortear.')
      return
    }

    clearRouletteWinner()

    if (filteredGames.length === 1) {
      const only = filteredGames[0]
      setWinnerGameId(only.userBoardgameId)
      showToast(`D20 parou em "${only.boardgame.name}"!`)
      const openTimer = window.setTimeout(() => {
        setSelectedId((curr) => curr ?? only.userBoardgameId)
      }, 1200)
      timersRef.current.push(openTimer)
      return
    }

    setIsRollingD20(true)
    const winnerIndex = Math.floor(Math.random() * filteredGames.length)
    const minSteps = Math.max(16, filteredGames.length * 2)
    const remainder = (winnerIndex - (minSteps % filteredGames.length) + filteredGames.length) % filteredGames.length
    const totalSteps = minSteps + remainder

    let currentStep = 0

    const stepLight = () => {
      const activeIndex = currentStep % filteredGames.length
      setLitGameId(filteredGames[activeIndex].userBoardgameId)

      if (filteredGames.length > 2) {
        const altIndex = (activeIndex + Math.floor(filteredGames.length / 2)) % filteredGames.length
        setAltLitGameId(altIndex !== activeIndex ? filteredGames[altIndex].userBoardgameId : null)
      } else {
        setAltLitGameId(null)
      }

      if (currentStep >= totalSteps) {
        const chosen = filteredGames[winnerIndex]
        setLitGameId(null)
        setAltLitGameId(null)
        setIsRollingD20(false)
        setWinnerGameId(chosen.userBoardgameId)
        showToast(`D20 parou em "${chosen.boardgame.name}"!`)

        const openTimer = window.setTimeout(() => {
          setSelectedId((curr) => curr ?? chosen.userBoardgameId)
        }, 1200)
        timersRef.current.push(openTimer)
        return
      }

      const progress = currentStep / totalSteps
      const delay = Math.round(55 + Math.pow(progress, 2.7) * 370)
      currentStep += 1
      const nextTimer = window.setTimeout(stepLight, delay)
      timersRef.current.push(nextTimer)
    }

    stepLight()
  }, [isRollingD20, filteredGames, clearRouletteWinner, showToast])

  const registerMatchForSelected = useCallback(async () => {
    if (!selectedGame || registeringMatch) return
    setRegisteringMatch(true)
    try {
      await registerMatch(selectedGame.userBoardgameId)
      setFetchState((prev) => ({
        ...prev,
        games: prev.games.map((item) => {
          if (item.userBoardgameId !== selectedGame.userBoardgameId) return item
          const nextPlays = item.plays + 1
          return {
            ...item,
            plays: nextPlays,
            hours: estimateHours(nextPlays, item.boardgame.playTime),
          }
        }),
      }))
      showToast(`+1 partida registrada para "${selectedGame.boardgame.name}"!`)
    } catch {
      showToast('Não foi possível registrar a partida. Tente novamente.')
    } finally {
      setRegisteringMatch(false)
    }
  }, [selectedGame, registeringMatch, showToast])

  const toggleSaleForSelected = useCallback(
    async (priceInput?: number) => {
      if (!selectedGame || togglingSale) return
      setTogglingSale(true)
      try {
        if (selectedGame.forSale && selectedGame.offerId) {
          await deleteShelfOffer(selectedGame.offerId)
          setFetchState((prev) => ({
            ...prev,
            games: prev.games.map((item) =>
              item.userBoardgameId === selectedGame.userBoardgameId
                ? { ...item, forSale: false, offerId: null }
                : item,
            ),
          }))
          showToast(`Anúncio de "${selectedGame.boardgame.name}" removido da loja.`)
        } else {
          const nextPrice =
            typeof priceInput === 'number' && Number.isFinite(priceInput) && priceInput > 0
              ? Math.round(priceInput)
              : selectedGame.salePrice
          const created = await createShelfOffer(selectedGame.userBoardgameId, nextPrice)
          setFetchState((prev) => ({
            ...prev,
            games: prev.games.map((item) =>
              item.userBoardgameId === selectedGame.userBoardgameId
                ? { ...item, forSale: true, salePrice: Math.round(Number(created.price)), offerId: created.id }
                : item,
            ),
          }))
          showToast(`"${selectedGame.boardgame.name}" anunciado na loja por R$ ${nextPrice}!`)
        }
      } catch {
        showToast('Não foi possível atualizar o anúncio na loja.')
      } finally {
        setTogglingSale(false)
      }
    },
    [selectedGame, togglingSale, showToast],
  )

  const removeSelectedFromShelf = useCallback(async () => {
    if (!selectedGame || removingGame) return
    setRemovingGame(true)
    try {
      await removeFromShelf(selectedGame.userBoardgameId, userId)
      const removedId = selectedGame.userBoardgameId
      const removedName = selectedGame.boardgame.name
      setFetchState((prev) => ({
        ...prev,
        games: prev.games.filter((item) => item.userBoardgameId !== removedId),
      }))
      setSelectedId(null)
      if (winnerGameId === removedId) setWinnerGameId(null)
      showToast(`"${removedName}" removido da sua estante.`)
    } catch {
      showToast('Não foi possível remover o jogo da estante.')
    } finally {
      setRemovingGame(false)
    }
  }, [selectedGame, removingGame, userId, winnerGameId, showToast])

  return {
    games,
    filteredGames,
    podiumGames,
    summary,
    categoryCounts,
    loading,
    error,
    retry: () => setAttempt((n) => n + 1),
    searchQuery,
    setSearchQuery: updateSearchQuery,
    selectedCategory,
    selectCategory,
    onlyForSale,
    toggleForSale,
    playersFilter,
    setPlayersFilter: updatePlayersFilter,
    sortBy,
    setSortBy: updateSortBy,
    resetFilters,
    selectedGame,
    openGame: (game: ShelfGame) => setSelectedId(game.userBoardgameId),
    closeGame: () => setSelectedId(null),
    registerMatchForSelected,
    registeringMatch,
    toggleSaleForSelected,
    togglingSale,
    removeSelectedFromShelf,
    removingGame,
    isRollingD20,
    litGameId,
    altLitGameId,
    winnerGameId,
    startD20Roulette,
    clearRouletteWinner,
    toasts,
  }
}
