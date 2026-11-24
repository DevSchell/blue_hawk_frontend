/** "1 jogador" / "4 jogadores" */
export function formatPlayers(n: number) {
  return n === 1 ? '1 jogador' : `${n} jogadores`
}

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Formata minutos em texto amigável (ex.: "45 min", "1h", "1h 30min") */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return 'Duração não informada'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (remaining === 0) return `${hours}h`
  return `${hours}h ${remaining}min`
}

export const formatMatchDuration = formatDuration

/** Formatação de data curta (ex.: "23/11/2026") */
export const matchDateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Formatação de data por extenso (ex.: "23 de novembro de 2026") */
export const matchFullDateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function formatMatchDate(date: Date | string | null | undefined): string {
  if (!date) return 'Data não informada'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Data não informada'
  return matchDateFormat.format(d)
}

export function formatMatchFullDate(date: Date | string | null | undefined): string {
  if (!date) return 'Data não informada'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Data não informada'
  return matchFullDateFormat.format(d)
}
