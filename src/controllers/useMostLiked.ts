import { useEffect, useState, useSyncExternalStore } from 'react'
import type { Boardgame } from '../models/boardgame'
import { likesStore } from '../models/likesStore'
import { listMostLiked } from '../models/services/boardgameService'
import { useDebouncedValue } from './useDebouncedValue'

export const RANKING_SIZE = 5

type State = { key: number; games: Boardgame[]; failed: boolean }

/**
 * Ranking "Mais curtidos" da Wiki. Busca de novo (com uma pequena espera) quando alguém curte ou descurte,
 * para a ordem acompanhar as curtidas desta sessão.
 */
export function useMostLiked() {
  const likesVersion = useSyncExternalStore(likesStore.subscribe, likesStore.version)
  const version = useDebouncedValue(likesVersion, 700)
  const [state, setState] = useState<State>({ key: -1, games: [], failed: false })

  useEffect(() => {
    const controller = new AbortController()
    listMostLiked(RANKING_SIZE, controller.signal)
      .then((games) => setState({ key: version, games, failed: false }))
      .catch(() => {
        if (!controller.signal.aborted) setState((prev) => ({ ...prev, key: version, failed: true }))
      })
    return () => controller.abort()
  }, [version])

  // Só entram no ranking jogos com pelo menos uma curtida
  const games = state.games.filter((game) => (likesStore.get(game.id)?.likeCount ?? game.likeCount ?? 0) > 0)

  return {
    games,
    /** Primeira carga ainda não chegou (recargas mantêm a lista na tela) */
    loading: state.key === -1,
    failed: state.failed,
  }
}
