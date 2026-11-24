import { useEffect, useState } from 'react'
import type { Offer, UserBoardgame } from '../models/market'
import { listOpenMatches } from '../models/services/openMatchService'
import { fetchAll } from '../models/services/shelfService'

export type ProfileStats = {
  games: number
  forSale: number
  /** Partidas do Jogue que a pessoa hospeda ou em que pediu para entrar */
  matches: number
  loading: boolean
}

/** Números do jogador para o topo do perfil e a aba de atividades. Falhas viram zero, sem travar a tela. */
export function useProfileStats(userId: string): ProfileStats {
  const [stats, setStats] = useState<ProfileStats>({ games: 0, forSale: 0, matches: 0, loading: true })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    Promise.all([
      fetchAll<UserBoardgame>('/user-boardgames', { userId }, signal).catch(() => []),
      fetchAll<Offer>('/offers', { userId, status: 'ACTIVE' }, signal).catch(() => []),
      listOpenMatches({ mine: true }, signal).catch(() => []),
    ]).then(([copies, offers, matches]) => {
      if (!signal.aborted) {
        setStats({ games: copies.length, forSale: offers.length, matches: matches.length, loading: false })
      }
    })
    return () => controller.abort()
  }, [userId])

  return stats
}
