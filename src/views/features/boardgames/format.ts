/** "1 jogador" / "4 jogadores" */
export function formatPlayers(n: number) {
  return n === 1 ? '1 jogador' : `${n} jogadores`
}

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
