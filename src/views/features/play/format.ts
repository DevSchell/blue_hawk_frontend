const dateTime = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' })
const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

/** "sáb., 05 de dez., 19:00" no fuso do navegador */
export function formatMatchDate(iso: string) {
  return dateTime.format(new Date(iso))
}

/** Partes para o "calendário" do card */
export function matchDateParts(iso: string) {
  const date = new Date(iso)
  return {
    day: day.format(date),
    month: month.format(date).replace('.', ''),
    weekday: weekday.format(date).replace('.', ''),
    time: time.format(date),
  }
}
