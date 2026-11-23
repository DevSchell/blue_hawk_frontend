/**
 * Utilitários e regras de negócio para as telas da aba 'Meu Perfil'.
 * Centraliza validações, cálculo de patches e resolução de abas para uso na UI e testes.
 */

export type ProfileTabId = 'dados' | 'foto' | 'atividades' | 'preferencias'

export const VALID_PROFILE_TABS: readonly ProfileTabId[] = ['dados', 'foto', 'atividades', 'preferencias'] as const

export const MAX_NAME_LENGTH = 150
export const MAX_EMAIL_LENGTH = 150
export const MAX_BIO_LENGTH = 500
export const MAX_PHOTO_SIZE_BYTES = 3 * 1024 * 1024 // 3 MB
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ProfileValidationResult = {
  valid: boolean
  error: string | null
  cleanName?: string
  cleanEmail?: string
}

/**
 * Valida os campos obrigatórios do perfil (nome e e-mail).
 */
export function validateProfileData(name: string, email: string): ProfileValidationResult {
  const cleanName = name.trim()
  const cleanEmail = email.trim()

  if (!cleanName) {
    return { valid: false, error: 'Informe o seu nome.' }
  }
  if (cleanName.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `O nome pode ter até ${MAX_NAME_LENGTH} caracteres.` }
  }
  if (!cleanEmail || !EMAIL_PATTERN.test(cleanEmail) || cleanEmail.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: 'Informe um e-mail válido.' }
  }

  return { valid: true, error: null, cleanName, cleanEmail }
}

/**
 * Calcula o patch de atualização para a API /users/{id}.
 * A API recusa e-mail idêntico ao já existente (conflito 409), portanto apenas os campos alterados são enviados.
 */
export function computeProfilePatch(
  current: { name: string; email: string },
  next: { name: string; email: string }
): { name?: string; email?: string } {
  const patch: { name?: string; email?: string } = {}
  const cleanName = next.name.trim()
  const cleanEmail = next.email.trim()

  if (cleanName && cleanName !== current.name) {
    patch.name = cleanName
  }
  if (cleanEmail && cleanEmail !== current.email) {
    patch.email = cleanEmail
  }
  return patch
}

export type PhotoValidationResult = {
  valid: boolean
  error: string | null
}

/**
 * Valida o arquivo selecionado para upload de foto de perfil.
 */
export function validatePhotoFile(file: { type: string; size: number }): PhotoValidationResult {
  if (!file.type || !file.type.startsWith('image/')) {
    return { valid: false, error: 'Selecione um arquivo de imagem válido (PNG, JPG ou WebP).' }
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return { valid: false, error: 'A imagem deve ter no máximo 3 MB.' }
  }
  return { valid: true, error: null }
}

/**
 * Resolve a aba ativa a partir da query string da URL (ex.: ?aba=foto).
 * Retorna 'dados' caso o parâmetro seja omitido ou inválido.
 */
export function resolveProfileTab(search: string): ProfileTabId {
  try {
    const params = new URLSearchParams(search)
    const tab = params.get('aba') as ProfileTabId | null
    if (tab && VALID_PROFILE_TABS.includes(tab)) {
      return tab
    }
  } catch {
    // Retorna o padrão em caso de erro de parsing
  }
  return 'dados'
}
