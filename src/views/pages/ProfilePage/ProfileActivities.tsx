import type { ReactNode } from 'react'
import type { ProfileStats } from '../../../controllers/useProfileStats'
import { Button } from '../../components/Button/Button'
import { GamesIcon, MatchesIcon, TrophyIcon } from '../../components/Icons/Icons'
import { ACCOUNT_ROUTES, MY_MATCHES_PATH, MY_OFFERS_PATH } from '../../layout/navigation'
import { navigate } from '../../layout/router'

type ActivityCard = {
  value: number
  label: string
  text: string
  action: string
  href: string
  icon: ReactNode
}

/** Atividades: os números do topo, com o contexto e o atalho de cada um */
export function ProfileActivities({ stats }: { stats: ProfileStats }) {
  const cards: ActivityCard[] = [
    {
      value: stats.games,
      label: 'Jogos na estante',
      text: 'Títulos da sua coleção pessoal.',
      action: 'Ver estante',
      href: ACCOUNT_ROUTES.shelf,
      icon: <GamesIcon />,
    },
    {
      value: stats.matches,
      label: 'Partidas no Jogue',
      text: 'Mesas que você hospeda ou em que pediu para entrar.',
      action: 'Ver partidas',
      href: MY_MATCHES_PATH,
      icon: <MatchesIcon />,
    },
    {
      value: stats.forSale,
      label: 'Anúncios na Loja',
      text: 'Jogos da sua estante à venda agora.',
      action: 'Ver meus anúncios',
      href: MY_OFFERS_PATH,
      icon: <TrophyIcon />,
    },
  ]

  return (
    <section className="account__section" aria-labelledby="perfil-atividades-title">
      <div>
        <h2 id="perfil-atividades-title">Atividades</h2>
        <p>O seu movimento no Blue Hawk: coleção, mesas e anúncios.</p>
      </div>

      <div className="profile-stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="profile-stat-card">
            <span className="profile-stat-card__number">{stats.loading ? '…' : card.value}</span>
            <span className="profile-stat-card__label">{card.label}</span>
            <p className="profile-stat-card__text">{card.text}</p>
            <div className="profile-stat-card__action">
              <Button variant="secondary" onClick={() => navigate(card.href)}>
                {card.icon}
                {card.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
