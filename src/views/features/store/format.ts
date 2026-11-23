const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

export function formatPrice(value: number | string) {
  return brl.format(Number(value))
}

/** "há 2 horas", "ontem"… a partir de uma data ISO */
export function formatSince(iso: string | null) {
  if (!iso) return ''
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'agora'
}
