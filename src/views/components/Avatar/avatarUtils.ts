export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Extrai as iniciais do nome (até duas partes), em maiúsculas.
 */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Retorna a classe CSS correspondente ao tamanho do avatar.
 */
export function getAvatarSizeClass(size: AvatarSize = 'md'): string {
  return `avatar--${size}`
}
