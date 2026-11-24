import { useSyncExternalStore } from 'react'
import type { ProfileStats } from '../../../controllers/useProfileStats'
import type { User } from '../../../models/services/accountService'
import { getUserProfileExtras, type UserProfileExtras } from '../../../models/session'
import { Avatar } from '../../components/Avatar/Avatar'
import { CameraIcon, MapPinIcon } from '../../components/Icons/Icons'
import { ACCOUNT_ROUTES, MY_MATCHES_PATH, MY_OFFERS_PATH } from '../../layout/navigation'

function subscribeToExtras(callback: () => void) {
  window.addEventListener('bluehawk:profile-extras-changed', callback)
  return () => window.removeEventListener('bluehawk:profile-extras-changed', callback)
}

/** Lê os extras do perfil e acompanha quando são salvos (o snapshot é a string, para ser estável) */
function useProfileExtras(userId: string): UserProfileExtras {
  const raw = useSyncExternalStore(
    subscribeToExtras,
    () => JSON.stringify(getUserProfileExtras(userId)),
    () => '{}',
  )
  return JSON.parse(raw) as UserProfileExtras
}

type ProfileBannerProps = {
  user: User
  stats: ProfileStats
  onEditPhoto: () => void
}

/** Topo do perfil: a "ficha do jogador", com avatar grande, nível, cidade, bio, estilos favoritos e números */
export function ProfileBanner({ user, stats, onEditPhoto }: ProfileBannerProps) {
  const extras = useProfileExtras(user.id)
  const genres = (extras.favoriteGenres ?? '')
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean)
    .slice(0, 6)

  const tiles = [
    { label: 'Jogos na estante', value: stats.games, href: ACCOUNT_ROUTES.shelf },
    { label: 'À venda', value: stats.forSale, href: MY_OFFERS_PATH },
    { label: 'Partidas', value: stats.matches, href: MY_MATCHES_PATH },
  ]

  return (
    <header className="profile-banner">
      <ProfileBannerArt />

      <div className="profile-banner__identity">
        <div className="profile-banner__avatar">
          <Avatar name={user.name} size="xl" userId={user.id} />
          <button type="button" className="profile-banner__photo" onClick={onEditPhoto} aria-label="Editar foto">
            <CameraIcon />
          </button>
        </div>

        <div className="profile-banner__who">
          <h1 className="profile-banner__kicker">Meu Perfil</h1>
          <p className="profile-banner__name">{user.name}</p>
          <div className="profile-banner__tags">
            <span className="badge profile-banner__role">{user.role === 'ADMIN' ? 'Administrador' : 'Jogador'}</span>
            {extras.experienceLevel && <span className="badge profile-banner__level">{extras.experienceLevel}</span>}
            {extras.city && (
              <span className="profile-banner__city">
                <MapPinIcon />
                {extras.city}
              </span>
            )}
          </div>
        </div>
      </div>

      {(extras.bio || genres.length > 0) && (
        <div className="profile-banner__about">
          {extras.bio && <blockquote className="profile-banner__bio">{extras.bio}</blockquote>}
          {genres.length > 0 && (
            <ul className="profile-banner__genres" aria-label="Jogos e estilos favoritos">
              {genres.map((genre) => (
                <li key={genre}>{genre}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ul className="profile-banner__stats" aria-label="Seus números">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <a href={tile.href} className="profile-banner__stat">
              <b>{stats.loading ? '–' : tile.value}</b>
              <span>{tile.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </header>
  )
}

/** Fundo decorativo: dados D20, meeples e peões espalhados, no traço dos ícones */
function ProfileBannerArt() {
  const dice = [
    { x: 78, y: 18, r: 22, rot: 12 },
    { x: 92, y: 70, r: 14, rot: -18 },
    { x: 64, y: 82, r: 9, rot: 30 },
  ]
  return (
    <svg className="profile-banner__art" viewBox="0 0 100 100" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
      {dice.map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y}) rotate(${d.rot}) scale(${d.r / 10})`}>
          <path d="M0-10l8.7 5v10L0 10l-8.7-5v-10z" />
          <path d="M0-5.5l4.8 8.3h-9.6z" />
          <path d="M0-10v4.5M8.7-5L4.8 2.8M-8.7-5l3.9 7.8M0 10l4.8-7.2M0 10l-4.8-7.2" />
        </g>
      ))}
      <path className="profile-banner__meeple" d="M84 40a3 3 0 1 1 6 0c0 1-.4 1.8-1 2.4l4 1.6c1 .4 1 1.8 0 2.2l-2.4.8 2.4 5.5h-5l-1-2.6-1 2.6h-5l2.4-5.5-2.4-.8c-1-.4-1-1.8 0-2.2l4-1.6a3 3 0 0 1-1-2.4z" />
      <circle className="profile-banner__dot" cx="70" cy="48" r="1.4" />
      <circle className="profile-banner__dot" cx="96" cy="30" r="1" />
      <circle className="profile-banner__dot" cx="58" cy="20" r="1" />
    </svg>
  )
}
