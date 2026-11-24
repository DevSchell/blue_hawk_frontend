/** Perfil do jogador (bio, cidade, nível, preferências, avatar) e o perfil público visto pelos outros */

export type ExperienceLevelApi = 'INICIANTE' | 'INTERMEDIARIO' | 'VETERANO'
export type ExperienceLevelLabel = 'Iniciante' | 'Intermediário' | 'Veterano'

const LEVEL_LABEL: Record<ExperienceLevelApi, ExperienceLevelLabel> = {
  INICIANTE: 'Iniciante',
  INTERMEDIARIO: 'Intermediário',
  VETERANO: 'Veterano',
}

export function levelLabel(level: ExperienceLevelApi | null): ExperienceLevelLabel | undefined {
  return level ? LEVEL_LABEL[level] : undefined
}

export function levelApi(label: ExperienceLevelLabel | undefined | null): ExperienceLevelApi | null {
  if (!label) return null
  const entry = Object.entries(LEVEL_LABEL).find(([, value]) => value === label)
  return entry ? (entry[0] as ExperienceLevelApi) : null
}

/** GET/PUT /users/me/profile */
export type MyProfile = {
  bio: string | null
  city: string | null
  experienceLevel: ExperienceLevelApi | null
  favoriteGenres: string | null
  isPublic: boolean
  showShelf: boolean
  matchAlerts: boolean
  offerAlerts: boolean
  avatarPreset: string | null
  /** Caminho relativo à API (foto enviada) */
  avatarUrl: string | null
}

export type MyProfileInput = Omit<MyProfile, 'avatarUrl'>

/** GET /users/{id}/public-profile */
export type PublicProfile = {
  id: string
  name: string
  role: 'ADMIN' | 'USER'
  avatarPreset: string | null
  avatarUrl: string | null
  isPublic: boolean
  isMe: boolean
  /** null quando o perfil é privado */
  profile: {
    bio: string | null
    city: string | null
    experienceLevel: ExperienceLevelApi | null
    favoriteGenres: string | null
    memberSince: string
  } | null
  stats: { games: number; forSale: number; matchesPlayed: number } | null
  /** null quando o perfil é privado ou a pessoa escondeu a estante */
  shelf:
    | {
        boardgameId: string
        name: string
        category: string | null
        coverPreset: string | null
        coverImageUrl: string | null
        offerId: string | null
        price: number | null
      }[]
    | null
}

/** Estilos favoritos ("Eurogames, Catan, …") em lista, sem vazios, até {@code max} */
export function splitGenres(text: string | null | undefined, max = 6) {
  return (text ?? '')
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean)
    .slice(0, max)
}

/** Pede para abrir o perfil público de alguém; quem ouve é o ProfileModalHost (na moldura do app) */
export const OPEN_PROFILE_EVENT = 'bluehawk:open-profile'

export function openUserProfile(userId: string) {
  window.dispatchEvent(new CustomEvent<{ userId: string }>(OPEN_PROFILE_EVENT, { detail: { userId } }))
}
