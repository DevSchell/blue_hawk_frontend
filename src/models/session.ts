export type Session = { name: string }

const SESSION_KEY = 'bluehawk.session'

/**
 * Ainda não há login no front: a sessão vem do localStorage, onde o login vai gravá-la.
 * Em dev, ?sessao=demo simula um usuário logado para ver o menu completo.
 */
export function readSession(): Session | null {
  try {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('sessao') === 'demo') {
      return { name: 'Maho' }
    }
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'name' in parsed && typeof parsed.name === 'string') {
      return { name: parsed.name }
    }
    return null
  } catch {
    return null
  }
}
