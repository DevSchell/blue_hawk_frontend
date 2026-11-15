import type { Boardgame } from '../../../models/boardgame'
import { cx } from '../../utils/classNames'
import './CategoryTag.css'

/** Categorias de exemplo, só para a prévia enquanto a API não envia a categoria do jogo */
const PREVIEW_CATEGORIES = ['Estratégia', 'Cooperativo', 'Família', 'Party', 'Cartas', 'Abstrato']

function previewCategory(id: string) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PREVIEW_CATEGORIES[hash % PREVIEW_CATEGORIES.length]
}

/** Categoria do jogo. Sem categoria na API, mostra uma de exemplo, marcada como prévia (borda tracejada) */
export function CategoryTag({ game, className }: { game: Boardgame; className?: string }) {
  const isPreview = !game.category

  return (
    <span
      className={cx('category-tag', isPreview && 'category-tag--preview', className)}
      title={isPreview ? 'Prévia: a API ainda não envia a categoria do jogo' : undefined}
    >
      {game.category || previewCategory(game.id)}
    </span>
  )
}
