import { useEffect, useState } from 'react'
import type { User } from '../../../models/services/accountService'
import { fetchAll } from '../../../models/services/shelfService'
import type { MatchParticipant, Offer, UserBoardgame } from '../../../models/market'
import { Button } from '../../components/Button/Button'
import { ACCOUNT_ROUTES } from '../../layout/navigation'
import { GamesIcon, MatchesIcon, TrophyIcon } from '../../components/Icons/Icons'

type ProfileActivitiesProps = {
  user: User
}

type Stats = {
  gamesCount: number
  offersCount: number
  matchesCount: number
  loading: boolean
}

export function ProfileActivities({ user }: ProfileActivitiesProps) {
  const [stats, setStats] = useState<Stats>({
    gamesCount: 0,
    offersCount: 0,
    matchesCount: 0,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    const abortController = new AbortController()

    async function loadStats() {
      try {
        const [copies, offers, matches] = await Promise.all([
          fetchAll<UserBoardgame>('/user-boardgames', { userId: user.id }, abortController.signal).catch(() => []),
          fetchAll<Offer>('/offers', { userId: user.id }, abortController.signal).catch(() => []),
          fetchAll<MatchParticipant>('/match-participants', { userId: user.id }, abortController.signal).catch(() => []),
        ])

        if (!cancelled) {
          setStats({
            gamesCount: copies.length,
            offersCount: offers.length,
            matchesCount: matches.length,
            loading: false,
          })
        }
      } catch {
        if (!cancelled) {
          setStats((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    loadStats()
    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [user.id])

  return (
    <section className="account__section" aria-labelledby="perfil-atividades-title">
      <div>
        <h2 id="perfil-atividades-title">Atividades & Estatísticas</h2>
        <p>Acompanhe o seu engajamento, jogos na coleção e partidas no Blue Hawk.</p>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span className="profile-stat-card__number">
            {stats.loading ? '…' : stats.gamesCount}
          </span>
          <span className="profile-stat-card__label">Jogos na Estante</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Títulos cadastrados em sua coleção pessoal de jogos de tabuleiro.
          </p>
          <div className="profile-stat-card__action">
            <Button variant="secondary" onClick={() => { window.location.assign(ACCOUNT_ROUTES.shelf) }}>
              <GamesIcon />
              Ver Estante
            </Button>
          </div>
        </div>

        <div className="profile-stat-card">
          <span className="profile-stat-card__number">
            {stats.loading ? '…' : stats.matchesCount}
          </span>
          <span className="profile-stat-card__label">Mesas & Partidas</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Partidas registradas, criadas ou que você participou.
          </p>
          <div className="profile-stat-card__action">
            <Button variant="secondary" onClick={() => { window.location.assign(ACCOUNT_ROUTES.matches) }}>
              <MatchesIcon />
              Ver Partidas
            </Button>
          </div>
        </div>

        <div className="profile-stat-card">
          <span className="profile-stat-card__number">
            {stats.loading ? '…' : stats.offersCount}
          </span>
          <span className="profile-stat-card__label">Ofertas no Mercado</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Jogos da sua estante atualmente anunciados na loja da comunidade.
          </p>
          <div className="profile-stat-card__action">
            <Button variant="secondary" onClick={() => { window.location.assign('/loja') }}>
              <TrophyIcon />
              Ir para Loja
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
