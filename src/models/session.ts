export type Session = {
  /** Nome exibido no menu (a API não devolve o nome no login: usamos o início do e-mail) */
  name: string
  email: string
}

type StoredSession = Session & { token: string }

const SESSION_KEY = 'bluehawk.session'

function readStored(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'name' in parsed &&
      'email' in parsed &&
      'token' in parsed &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.token === 'string'
    ) {
      return { name: parsed.name, email: parsed.email, token: parsed.token }
    }
    return null
  } catch {
    return null
  }
}

function writeStored(session: StoredSession | null) {
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // Sem storage (aba anônima, bloqueio): a sessão vale só até recarregar
  }
}

/** Em dev, ?sessao=demo simula um usuário logado (sem token) para ver o menu completo. */
export function readSession(): Session | null {
  if (
    Boolean(import.meta.env?.DEV) &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('sessao') === 'demo'
  ) {
    return { name: 'Maho', email: 'maho@exemplo.com' }
  }
  const stored = readStored()
  return stored ? { name: stored.name, email: stored.email } : null
}

export function readToken(): string | null {
  return readStored()?.token ?? null
}

/** Id do usuário logado: a API o coloca no "sub" do JWT (JwtTokenService) */
export function readUserId(): string | null {
  const payload = readToken()?.split('.')[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json: unknown = JSON.parse(atob(padded))
    return json && typeof json === 'object' && 'sub' in json && typeof json.sub === 'string' ? json.sub : null
  } catch {
    return null
  }
}

export function saveSession(email: string, token: string): Session {
  const session = { name: email.split('@')[0], email }
  writeStored({ ...session, token })
  return session
}

/** A API devolve um token novo a cada chamada autenticada (JwtRotationFilter) */
export function updateToken(token: string) {
  const stored = readStored()
  if (stored) writeStored({ ...stored, token })
}

/** Nome e e-mail reais do usuário (o login só devolve o token) */
export function updateStoredProfile(name: string, email: string): Session | null {
  const stored = readStored()
  if (!stored) return null
  writeStored({ ...stored, name, email })
  return { name, email }
}

export function clearSession() {
  writeStored(null)
}

const AVATAR_PREFIX = 'bluehawk.avatar.'
const PROFILE_EXTRAS_PREFIX = 'bluehawk.profile-extras.'

export type UserProfileExtras = {
  bio?: string
  city?: string
  favoriteGenres?: string
  experienceLevel?: 'Iniciante' | 'Intermediário' | 'Veterano'
  isPublic?: boolean
  showShelf?: boolean
  matchAlerts?: boolean
  offerAlerts?: boolean
}

export function getUserAvatar(userId?: string | null): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  const id = userId || readUserId() || 'guest'
  try {
    return window.localStorage.getItem(`${AVATAR_PREFIX}${id}`)
  } catch {
    return null
  }
}

export function saveUserAvatar(avatarUrl: string, userId?: string | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const id = userId || readUserId() || 'guest'
  try {
    window.localStorage.setItem(`${AVATAR_PREFIX}${id}`, avatarUrl)
    window.dispatchEvent(new CustomEvent('bluehawk:avatar-changed', { detail: { userId: id, avatarUrl } }))
  } catch {
    // LocalStorage indisponível
  }
}

export function clearUserAvatar(userId?: string | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const id = userId || readUserId() || 'guest'
  try {
    window.localStorage.removeItem(`${AVATAR_PREFIX}${id}`)
    window.dispatchEvent(new CustomEvent('bluehawk:avatar-changed', { detail: { userId: id, avatarUrl: null } }))
  } catch {
    // LocalStorage indisponível
  }
}

export function getUserProfileExtras(userId?: string | null): UserProfileExtras {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  const id = userId || readUserId() || 'guest'
  try {
    const raw = window.localStorage.getItem(`${PROFILE_EXTRAS_PREFIX}${id}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveUserProfileExtras(extras: UserProfileExtras, userId?: string | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const id = userId || readUserId() || 'guest'
  try {
    const current = getUserProfileExtras(id)
    window.localStorage.setItem(`${PROFILE_EXTRAS_PREFIX}${id}`, JSON.stringify({ ...current, ...extras }))
    window.dispatchEvent(new CustomEvent('bluehawk:profile-extras-changed', { detail: { userId: id } }))
  } catch {
    // LocalStorage indisponível
  }
}
