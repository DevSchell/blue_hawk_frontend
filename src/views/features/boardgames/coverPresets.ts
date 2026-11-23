/** Desenho de uma capa: qual das 5 artes (variant) e a variação dela (offset) */
export type CoverArt = { variant: number; offset: number }

/** Artes do site que podem ser escolhidas como capa (as chaves são validadas pela API: Boardgame.COVER_PRESETS) */
export const COVER_PRESETS: { key: string; label: string; art: CoverArt }[] = [
  { key: 'waves-1', label: 'Ondas', art: { variant: 0, offset: 0 } },
  { key: 'waves-2', label: 'Ondas (alternada)', art: { variant: 0, offset: 1 } },
  { key: 'beam-1', label: 'Farol', art: { variant: 1, offset: 0 } },
  { key: 'beam-2', label: 'Farol (espelhado)', art: { variant: 1, offset: 1 } },
  { key: 'peaks-1', label: 'Picos', art: { variant: 2, offset: 0 } },
  { key: 'peaks-2', label: 'Picos (deslocados)', art: { variant: 2, offset: 1 } },
  { key: 'valley', label: 'Corvo no vale', art: { variant: 3, offset: 0 } },
  { key: 'board-1', label: 'Tabuleiro', art: { variant: 4, offset: 0 } },
  { key: 'board-2', label: 'Tabuleiro (alternado)', art: { variant: 4, offset: 1 } },
]
