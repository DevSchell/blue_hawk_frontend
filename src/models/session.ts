export type Session = {
  /** Nome exibido no menu (a API não devolve o nome no login: usamos o início do e-mail) */
  name: string
  email: string
  /** Papel ADMIN no token. Só decide o que mostrar: quem garante a permissão é a API. */
  isAdmin: boolean
}

type StoredSession = { name: string; email: string; token: string }

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
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('sessao') === 'demo') {
    return { name: 'Maho', email: 'maho@exemplo.com', isAdmin: false }
  }
  const stored = readStored()
  return stored ? { name: stored.name, email: stored.email, isAdmin: isAdminToken(stored.token) } : null
}

export function readToken(): string | null {
  return readStored()?.token ?? null
}

/** Claims do JWT (sem validar a assinatura: só para a interface; quem valida é a API) */
function readClaim(token: string | null | undefined, claim: string): string | null {
  const payload = token?.split('.')[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json: unknown = JSON.parse(atob(padded))
    if (!json || typeof json !== 'object' || !(claim in json)) return null
    const value = (json as Record<string, unknown>)[claim]
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}

/** O papel vai no claim "scope" (JwtTokenService); a API o atualiza a cada token renovado */
function isAdminToken(token: string | null | undefined) {
  return readClaim(token, 'scope') === 'ADMIN'
}

/** Id do usuário logado: a API o coloca no "sub" do JWT (JwtTokenService) */
export function readUserId(): string | null {
  return readClaim(readToken(), 'sub')
}

export function readIsAdmin(): boolean {
  return isAdminToken(readToken())
}

export function saveSession(email: string, token: string): Session {
  const stored = { name: email.split('@')[0], email, token }
  writeStored(stored)
  return { name: stored.name, email, isAdmin: isAdminToken(token) }
}

/** A API devolve um token novo a cada chamada autenticada (JwtRotationFilter) */
export function updateToken(token: string) {
  const stored = readStored()
  if (stored) writeStored({ ...stored, token })
}

export function clearSession() {
  writeStored(null)
}
