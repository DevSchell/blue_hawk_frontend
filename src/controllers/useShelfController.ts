import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createOffer } from '../models/services/marketService'
import type { OfferDetailsInput } from '../models/offerDetails'
import { approvalStatusOf, type Boardgame } from '../models/boardgame'
import { readIsAdmin, readUserId } from '../models/session'
import { ApiError } from '../models/services/apiClient'
import { getBoardgameById } from '../models/services/boardgameService'
import { listPlayedByMe } from '../models/services/openMatchService'
import {
  addToShelf,
  deleteShelfOffer,
  listUserBoardgames,
  listUserOffers,
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
  /** Categorias marcadas no filtro (vazio = todas) */
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [onlyForSale, setOnlyForSale] = useState(false)
  const [playersFilter, setPlayersFilter] = useState<PlayersFilterOption>('any')
  const [sortBy, setSortBy] = useState<ShelfSortOption>('most-played')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [togglingSale, setTogglingSale] = useState(false)
  const [removingGame, setRemovingGame] = useState(false)

  const [isRollingD20, setIsRollingD20] = useState(false)
  const [litGameId, setLitGameId] = useState<string | null>(null)
  const [altLitGameId, setAltLitGameId] = useState<string | null>(null)
  const [winnerGameId, setWinnerGameId] = useState<string | null>(null)

  /** Modal de jogo: 'create' cadastra um novo; um Boardgame abre a correção dele */
  const [gameForm, setGameForm] = useState<'create' | Boardgame | null>(null)
  /** Cópia sendo anunciada na modal de venda */
  const [saleGameId, setSaleGameId] = useState<string | null>(null)
  const [saleError, setSaleError] = useState('')
  /** Modal "Adicionar jogo": escolher um jogo da Wiki */
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)

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
        // Partidas jogadas = partidas do Jogue já realizadas (host ou aceito), por jogo
        const played = await listPlayedByMe(controller.signal).catch(() => [])
        const playsByBoardgame = new Map<string, number>(played.map((p) => [p.boardgameId, p.plays] as const))

        const groupedByBoardgame = new Map<string, string[]>()
        for (const entry of entries) {
          const list = groupedByBoardgame.get(entry.boardgameId) ?? []
          list.push(entry.id)
          groupedByBoardgame.set(entry.boardgameId, list)
        }

        const resolved: ShelfGame[] = []

        for (const [boardgameId, copyIds] of groupedByBoardgame.entries()) {
          if (controller.signal.aborted) return
          try {
            const boardgame = await getBoardgameById(boardgameId, controller.signal)
            const plays = playsByBoardgame.get(boardgameId) ?? 0
            let activeOffer = undefined
            let primaryCopyId = copyIds[0]

            for (const copyId of copyIds) {
              const foundOffer = activeOffersByCopy.get(copyId)
              if (foundOffer && !activeOffer) {
                activeOffer = foundOffer
                primaryCopyId = copyId
              }
            }

            resolved.push({
              userBoardgameId: primaryCopyId,
              copyIds,
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
            if (groupedByBoardgame.size === 1) throw itemErr
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

  const ownedBoardgameIds = useMemo(() => new Set(games.map((g) => g.boardgame.id)), [games])

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

    const statsByCategory: Record<string, { plays: number; count: number }> = {}
    for (const g of games) {
      const current = statsByCategory[g.category] ?? { plays: 0, count: 0 }
      statsByCategory[g.category] = {
        plays: current.plays + g.plays,
        count: current.count + 1,
      }
    }
    let topCategory = '—'
    let bestPlays = -1
    let bestCount = -1
    for (const [cat, stat] of Object.entries(statsByCategory)) {
      if (stat.plays > bestPlays || (stat.plays === bestPlays && stat.count > bestCount)) {
        bestPlays = stat.plays
        bestCount = stat.count
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
      const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(item.category)
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
  }, [games, searchQuery, selectedCategories, onlyForSale, playersFilter, sortBy])

  const selectedGame = useMemo(
    () => games.find((g) => g.userBoardgameId === selectedId) ?? null,
    [games, selectedId],
  )

  const saleGame = useMemo(
    () => games.find((g) => g.userBoardgameId === saleGameId) ?? null,
    [games, saleGameId],
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

  /** Marca ou desmarca uma categoria no filtro de seleção múltipla */
  const toggleCategory = useCallback(
    (category: string) => {
      if (isRollingD20) return
      clearRouletteWinner()
      setSelectedCategories((current) =>
        current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
      )
    },
    [isRollingD20, clearRouletteWinner],
  )

  const clearCategories = useCallback(() => {
    if (isRollingD20) return
    clearRouletteWinner()
    setSelectedCategories([])
  }, [isRollingD20, clearRouletteWinner])

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
    setSelectedCategories([])
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

  const handleGameSaved = useCallback(
    async (saved: Boardgame, warning?: string) => {
      const editing = gameForm !== 'create' && gameForm !== null
      setGameForm(null)
      if (warning) showToast(warning)

      if (editing) {
        const wasRejected = approvalStatusOf(gameForm) === 'REJECTED'
        setFetchState((prev) => ({
          ...prev,
          games: prev.games.map((item) =>
            item.boardgame.id === saved.id
              ? { ...item, boardgame: saved, category: resolveGameCategory(saved) }
              : item,
          ),
        }))
        showToast(
          wasRejected
            ? `"${saved.name}" corrigido e reenviado para aprovação.`
            : `Dados de "${saved.name}" atualizados.`,
        )
        return
      }

      // Cadastro de admin não cria cópia na estante (vai direto ao catálogo): adiciona aqui
      if (!saved.userBoardgameId && userId) {
        try {
          await addToShelf(userId, saved.id)
        } catch {
          showToast(`"${saved.name}" entrou no catálogo, mas não foi adicionado à sua estante.`)
        }
      }
      showToast(
        approvalStatusOf(saved) === 'APPROVED'
          ? `"${saved.name}" cadastrado no catálogo e na sua estante.`
          : `"${saved.name}" está na sua estante e aguarda aprovação para entrar na Wiki.`,
      )
      setAttempt((n) => n + 1)
    },
    [gameForm, userId, showToast],
  )

  /** Tira o anúncio do jogo aberto da loja */
  const removeSaleForSelected = useCallback(async () => {
    if (!selectedGame || togglingSale || !selectedGame.offerId) return
    setTogglingSale(true)
    try {
      await deleteShelfOffer(selectedGame.offerId)
      setFetchState((prev) => ({
        ...prev,
        games: prev.games.map((item) =>
          item.userBoardgameId === selectedGame.userBoardgameId ? { ...item, forSale: false, offerId: null } : item,
        ),
      }))
      showToast(`Anúncio de "${selectedGame.boardgame.name}" removido da loja.`)
    } catch {
      showToast('Não foi possível remover o anúncio da loja.')
    } finally {
      setTogglingSale(false)
    }
  }, [selectedGame, togglingSale, showToast])

  /** "Anunciar venda": troca a modal de detalhes pela modal de venda, onde o preço é informado */
  const openSaleForSelected = useCallback(() => {
    if (!selectedGame) return
    if (approvalStatusOf(selectedGame.boardgame) !== 'APPROVED') {
      showToast('Só jogos aprovados podem ser anunciados na loja.')
      return
    }
    setSaleError('')
    setSaleGameId(selectedGame.userBoardgameId)
    setSelectedId(null)
  }, [selectedGame, showToast])

  /** Confirma o anúncio com os dados da modal de venda (preço, estado, entrega e descrição) */
  const confirmSale = useCallback(
    async (details: OfferDetailsInput) => {
      if (!saleGame || togglingSale) return
      setTogglingSale(true)
      setSaleError('')
      try {
        const created = await createOffer(saleGame.userBoardgameId, details)
        setFetchState((prev) => ({
          ...prev,
          games: prev.games.map((item) =>
            item.userBoardgameId === saleGame.userBoardgameId
              ? { ...item, forSale: true, salePrice: Math.round(Number(created.price)), offerId: created.id }
              : item,
          ),
        }))
        setSaleGameId(null)
        showToast(`"${saleGame.boardgame.name}" anunciado na loja por R$ ${details.price}!`)
      } catch (err) {
        setSaleError(
          err instanceof ApiError && err.status === 409
            ? 'Este jogo ainda não foi aprovado para a Wiki e não pode ir para a loja.'
            : 'Não foi possível criar o anúncio. Tente de novo.',
        )
      } finally {
        setTogglingSale(false)
      }
    },
    [saleGame, togglingSale, showToast],
  )

  const removeSelectedFromShelf = useCallback(async () => {
    if (!selectedGame || removingGame) return
    setRemovingGame(true)
    try {
      await removeFromShelf(selectedGame.copyIds, userId)
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
    signedIn: Boolean(userId),
    isAdmin: readIsAdmin(),
    gameForm,
    isAddGameOpen,
    ownedBoardgameIds,
    openAddGame: () => setIsAddGameOpen(true),
    closeAddGame: () => setIsAddGameOpen(false),
    /** Jogo da Wiki adicionado: a modal fica aberta para adicionar outros; a estante recarrega */
    handleWikiGameAdded: (game: Boardgame) => {
      showToast(`"${game.name}" adicionado à sua estante.`)
      setAttempt((n) => n + 1)
    },
    /** "Não achou seu jogo?": troca a busca da Wiki pelo cadastro de um jogo novo */
    openCreateGame: () => {
      setIsAddGameOpen(false)
      setGameForm('create')
    },
    /** Fecha a modal do jogo antes de abrir a edição, para não empilhar duas modais */
    openEditGame: (game: Boardgame) => {
      setSelectedId(null)
      setGameForm(game)
    },
    closeGameForm: () => setGameForm(null),
    handleGameSaved,
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
    selectedCategories,
    toggleCategory,
    clearCategories,
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
    removeSaleForSelected,
    openSaleForSelected,
    saleGame,
    saleError,
    confirmSale,
    closeSale: () => setSaleGameId(null),
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
